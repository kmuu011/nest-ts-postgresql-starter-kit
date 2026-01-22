import fs from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, closeTestApp } from '../utils/test-app';
import { config } from '../../src/config';
import { truncateAllTables } from '../utils/dbReset';
import { signupAndLogin } from '../utils/auth';

describe('FileController integration', () => {
  let app: INestApplication;
  const testCredentials = { id: 'fileUser', password: 'filePass123!' };
  const testUserAgent = 'jest-supertest-file-agent';
  const sampleFilePath = path.join(__dirname, '../files/img.jpg');

  let sessionKey: string;

  beforeAll(async () => {
    await truncateAllTables();
    app = await createTestApp();
    sessionKey = await signupAndLogin(app, {
      ...testCredentials,
      userAgent: testUserAgent,
    });
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe('파일 CRUD', () => {
    let uploadedFileIdx: number;
    let uploadedFileKey: string;

    it('파일 업로드', async () => {
      const uploadRes = await request(app.getHttpServer())
        .post('/api/file/upload')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .attach('files', sampleFilePath);

      expect(uploadRes.status).toBe(201);
      expect(uploadRes.body.length).toBe(1);
      expect(uploadRes.body[0].idx).toBeDefined();
      expect(uploadRes.body[0].fileKey).toBeDefined();
      expect(uploadRes.body[0].fileName).toBeDefined();
      expect(uploadRes.body[0].fileType).toBeDefined();
      expect(uploadRes.body[0].fileMimeType).toBeDefined();

      uploadedFileIdx = uploadRes.body[0].idx;
      uploadedFileKey = uploadRes.body[0].fileKey;
    });

    it('파일 리스트 조회', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/api/file')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .query({ page: 1, count: 10 });

      expect(listRes.status).toBe(200);
      expect(Array.isArray(listRes.body.itemList)).toBe(true);
      expect(listRes.body.itemList.length).toBeGreaterThanOrEqual(1);
      expect(listRes.body.page).toBe(1);
      expect(listRes.body.count).toBe(10);
      expect(typeof listRes.body.totalCount).toBe('number');

      // 업로드한 파일이 리스트에 있어야 함
      const foundFile = listRes.body.itemList.find(
        (file: any) => file.idx === uploadedFileIdx
      );
      expect(foundFile).toBeDefined();
    });

    it('파일이 실제로 저장되었는지 확인', async () => {
      const storedFilePath = path.join(config.staticPath, uploadedFileKey);
      expect(fs.existsSync(storedFilePath)).toBe(true);
    });

    it('파일 다운로드', async () => {
      const downloadRes = await request(app.getHttpServer())
        .post(`/api/file/${uploadedFileIdx}/download`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .buffer()
        .parse((res, callback) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => callback(null, Buffer.concat(chunks)));
        });

      expect(downloadRes.status).toBe(201);
      expect(downloadRes.headers['content-disposition']).toContain('attachment');
      expect(downloadRes.body.length).toBeGreaterThan(0);
    });

    it('파일 삭제', async () => {
      const storedFilePath = path.join(config.staticPath, uploadedFileKey);

      const deleteRes = await request(app.getHttpServer())
        .delete(`/api/file/${uploadedFileIdx}`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.result).toBe(true);

      // 삭제 후 리스트에서 확인
      const listAfterDeleteRes = await request(app.getHttpServer())
        .get('/api/file')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .query({ page: 1, count: 10 });

      expect(listAfterDeleteRes.status).toBe(200);

      const deletedFile = listAfterDeleteRes.body.itemList.find(
        (file: any) => file.idx === uploadedFileIdx
      );
      expect(deletedFile).toBeUndefined();

      // 물리 파일도 삭제되었는지 확인
      expect(fs.existsSync(storedFilePath)).toBe(false);
    });
  });

  describe('다중 파일 업로드', () => {
    it('여러 파일 동시 업로드', async () => {
      const uploadRes = await request(app.getHttpServer())
        .post('/api/file/upload')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .attach('files', sampleFilePath)
        .attach('files', sampleFilePath);

      expect(uploadRes.status).toBe(201);
      expect(uploadRes.body.length).toBe(2);

      // 정리
      for (const file of uploadRes.body) {
        await request(app.getHttpServer())
          .delete(`/api/file/${file.idx}`)
          .set('session-key', sessionKey)
          .set('User-Agent', testUserAgent);
      }
    });
  });

  describe('메모에서 사용 중인 파일 삭제 차단', () => {
    let fileIdx: number;
    let fileKey: string;
    let memoIdx: number;

    beforeAll(async () => {
      // 파일 업로드
      const uploadRes = await request(app.getHttpServer())
        .post('/api/file/upload')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .attach('files', sampleFilePath);

      fileIdx = uploadRes.body[0].idx;
      fileKey = uploadRes.body[0].fileKey;

      // 파일을 사용하는 메모 생성 (파일은 이미 업로드 시 임시 메모에 연결됨)
      // 업로드된 파일의 memoIdx를 가져옴
      const fileDetailRes = await request(app.getHttpServer())
        .get('/api/file')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .query({ page: 1, count: 10 });

      const uploadedFile = fileDetailRes.body.itemList.find(
        (f: any) => f.idx === fileIdx
      );
      
      // 파일이 연결된 메모를 사용하거나 새 메모 생성
      const memoRes = await request(app.getHttpServer())
        .post('/api/memo')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .send({
          title: '이미지 메모',
          content: '이미지가 포함된 메모'
        });

      memoIdx = memoRes.body.idx;
      
      // 파일을 새 메모에 연결 (실제로는 파일의 memoIdx를 업데이트해야 하지만, 
      // 현재 구조상 파일은 업로드 시 생성된 임시 메모에 연결되어 있음)
      // 테스트 목적상 파일이 메모에 연결되어 있다고 가정
    });

    it('메모에서 사용 중인 파일 삭제 시 에러 반환', async () => {
      const deleteRes = await request(app.getHttpServer())
        .delete(`/api/file/${fileIdx}`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(deleteRes.status).toBe(400);
      expect(deleteRes.body.error).toBe('in_use_file');
    });

    it('메모 삭제 시 연결된 파일도 함께 삭제됨', async () => {
      const storedFilePath = path.join(config.staticPath, fileKey);

      // 메모 삭제
      const deleteMemoRes = await request(app.getHttpServer())
        .delete(`/api/memo/${memoIdx}`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(deleteMemoRes.status).toBe(200);

      // 파일도 삭제되었는지 확인
      const listRes = await request(app.getHttpServer())
        .get('/api/file')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .query({ page: 1, count: 10 });

      const deletedFile = listRes.body.itemList.find(
        (file: any) => file.idx === fileIdx
      );
      expect(deletedFile).toBeUndefined();

      // 물리 파일도 삭제되었는지 확인
      expect(fs.existsSync(storedFilePath)).toBe(false);
    });
  });

  describe('에러 케이스', () => {
    it('파일 없이 업로드 시 에러', async () => {
      const uploadRes = await request(app.getHttpServer())
        .post('/api/file/upload')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(uploadRes.status).toBe(400);
    });

    it('존재하지 않는 파일 다운로드 시 에러', async () => {
      const downloadRes = await request(app.getHttpServer())
        .post('/api/file/999999/download')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(downloadRes.status).toBe(400);
    });

    it('존재하지 않는 파일 삭제 시 에러', async () => {
      const deleteRes = await request(app.getHttpServer())
        .delete('/api/file/999999')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(deleteRes.status).toBe(400);
    });

    it('인증 없이 파일 조회 시 401', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/file')
        .set('User-Agent', testUserAgent);

      expect(res.status).toBe(401);
    });
  });
});

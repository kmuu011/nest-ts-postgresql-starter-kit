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
  let uploadedFileIdx: number;
  let uploadedFileKey: string;

  beforeAll(async () => {
    await truncateAllTables();
    app = await createTestApp();
    sessionKey = await signupAndLogin(app, {
      ...testCredentials,
      userAgent: testUserAgent,
    });
  });

  afterAll(async () => {
    await truncateAllTables();
    await closeTestApp();
  });

  it('파일 업로드, 조회, 다운로드, 삭제 플로우를 수행해야 함', async () => {
    // 파일 업로드
    const uploadRes = await request(app.getHttpServer())
      .post('/api/file/upload')
      .set('session-key', sessionKey)
      .set('User-Agent', testUserAgent)
      .attach('files', sampleFilePath);

    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body.length).toBe(1);

    // 파일 리스트 조회
    const listRes = await request(app.getHttpServer())
      .get('/api/file')
      .set('session-key', sessionKey)
      .set('User-Agent', testUserAgent)
      .query({ page: 1, count: 10 });

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.itemList)).toBe(true);
    expect(listRes.body.itemList.length).toBeGreaterThanOrEqual(1);
    expect(typeof listRes.body.totalCount).toBe('number');

    const latestFile = listRes.body.itemList[0];
    uploadedFileIdx = latestFile.idx;
    uploadedFileKey = latestFile.fileKey;

    // 파일이 실제로 저장되었는지 확인
    const storedFilePath = path.join(config.staticPath, uploadedFileKey);
    expect(fs.existsSync(storedFilePath)).toBe(true);

    // 파일 다운로드
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

    // 파일 삭제
    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/file/${uploadedFileIdx}`)
      .set('session-key', sessionKey)
      .set('User-Agent', testUserAgent);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.result).toBe(true);

    // 삭제 후 리스트 조회
    const listAfterDeleteRes = await request(app.getHttpServer())
      .get('/api/file')
      .set('session-key', sessionKey)
      .set('User-Agent', testUserAgent)
      .query({ page: 1, count: 10 });

    expect(listAfterDeleteRes.status).toBe(200);
    expect(Array.isArray(listAfterDeleteRes.body.itemList)).toBe(true);

    // 삭제된 파일은 리스트에 없어야 함
    expect(
      listAfterDeleteRes.body.itemList.find((file: any) => file.idx === uploadedFileIdx)
    ).toBeUndefined();

    // 물리 파일도 삭제되었는지 확인
    expect(fs.existsSync(storedFilePath)).toBe(false);
  });
});

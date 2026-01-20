import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, closeTestApp } from '../utils/test-app';
import { truncateAllTables } from '../utils/dbReset';
import { signupAndLogin } from '../utils/auth';

describe('MemoController integration', () => {
  let app: INestApplication;
  const testCredentials = { id: 'memoUser', password: 'memoPass123' };
  const testUserAgent = 'jest-supertest-agent';

  let sessionKey: string;
  let memoIdx: number;

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

  it('메모 CRUD 플로우를 수행해야 함', async () => {
    // 메모 생성
    const createRes = await request(app.getHttpServer())
      .post('/api/memo')
      .set('session-key', sessionKey)
      .set('User-Agent', testUserAgent)
      .send({ memo: '첫 번째 메모입니다.' });

    expect(createRes.status).toBe(201);
    expect(typeof createRes.body.idx).toBe('number');

    memoIdx = createRes.body.idx;

    // 메모 단건 조회
    const detailRes = await request(app.getHttpServer())
      .get(`/api/memo/${memoIdx}`)
      .set('session-key', sessionKey)
      .set('User-Agent', testUserAgent);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.idx).toBe(memoIdx);
    expect(detailRes.body.memo).toBe('첫 번째 메모입니다.');

    // 메모 리스트 조회
    const listRes = await request(app.getHttpServer())
      .get('/api/memo')
      .set('session-key', sessionKey)
      .set('User-Agent', testUserAgent)
      .query({ page: 1, count: 10 });

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.itemList)).toBe(true);
    expect(listRes.body.itemList.length).toBeGreaterThanOrEqual(1);
    expect(listRes.body.page).toBe(1);
    expect(listRes.body.count).toBe(10);
    expect(typeof listRes.body.totalCount).toBe('number');

    // 메모 수정
    const updateRes = await request(app.getHttpServer())
      .patch(`/api/memo/${memoIdx}`)
      .set('session-key', sessionKey)
      .set('User-Agent', testUserAgent)
      .send({ memo: '수정된 메모입니다.' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.result).toBe(true);

    // 수정된 메모 조회
    const updatedDetailRes = await request(app.getHttpServer())
      .get(`/api/memo/${memoIdx}`)
      .set('session-key', sessionKey)
      .set('User-Agent', testUserAgent);

    expect(updatedDetailRes.status).toBe(200);
    expect(updatedDetailRes.body.memo).toBe('수정된 메모입니다.');

    // 메모 삭제
    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/memo/${memoIdx}`)
      .set('session-key', sessionKey)
      .set('User-Agent', testUserAgent);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.result).toBe(true);

    // 삭제 후 리스트 조회
    const listAfterDeleteRes = await request(app.getHttpServer())
      .get('/api/memo')
      .set('session-key', sessionKey)
      .set('User-Agent', testUserAgent)
      .query({ page: 1, count: 10 });

    expect(listAfterDeleteRes.status).toBe(200);
    expect(Array.isArray(listAfterDeleteRes.body.itemList)).toBe(true);

    // 삭제된 메모는 리스트에 없어야 함
    const deletedMemo = listAfterDeleteRes.body.itemList.find(
      (memo: any) => memo.idx === memoIdx
    );
    expect(deletedMemo).toBeUndefined();
  });
});

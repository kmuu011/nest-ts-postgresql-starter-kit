import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, closeTestApp } from '../utils/test-app';
import { truncateAllTables } from '../utils/dbReset';

describe('MemberController integration', () => {
  let app: INestApplication;
  let sessionKey: string;

  beforeAll(async () => {
    await truncateAllTables();
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  it('회원가입 돼야함', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/member/signup')
      .send({ id: 'qa1', password: 'qa1' });

    expect(res.body.result).toBeTruthy();
    expect(res.status).toBe(201);
  });

  it('로그인 돼야함', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/member/login')
      .send({ id: 'qa1', password: 'qa1' });

    sessionKey = res.body.sessionKey;

    expect(typeof res.body.sessionKey).toBe('string');
    expect(res.status).toBe(201);
  });

  it('중복 여부를 반환해야 함', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/member/duplicateCheck')
      .query({ key: 'id', value: 'tester' });

    expect(res.body.isDuplicated).toBeFalsy();
    expect(res.status).toBe(200);

    const res2 = await request(app.getHttpServer())
      .get('/api/member/duplicateCheck')
      .query({ key: 'id', value: 'qa1' });

    expect(res2.body.isDuplicated).toBeTruthy();
    expect(res2.status).toBe(200);
  });

  it('인증 확인이 돼야함', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/member/authCheck')
      .set('session-key', sessionKey);

    expect(res.status).toBe(200);
  });
});

import request from 'supertest';
import { INestApplication } from '@nestjs/common';

interface SignupAndLoginParams {
  id: string;
  password: string;
  userAgent?: string;
}

export async function signupAndLogin(
  app: INestApplication,
  params: SignupAndLoginParams
): Promise<string> {
  const { id, password, userAgent = 'jest-test-agent' } = params;

  // 회원가입
  const signupRes = await request(app.getHttpServer())
    .post('/api/member/signup')
    .send({ id, password });

  if (signupRes.status !== 201) {
    throw new Error(`Signup failed: ${JSON.stringify(signupRes.body)}`);
  }

  // 로그인
  const loginRes = await request(app.getHttpServer())
    .post('/api/member/login')
    .set('User-Agent', userAgent)
    .send({ id, password });

  if (loginRes.status !== 201 || !loginRes.body.sessionKey) {
    throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
  }

  return loginRes.body.sessionKey;
}

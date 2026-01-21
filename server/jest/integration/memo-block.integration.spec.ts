import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, closeTestApp } from '../utils/test-app';
import { truncateAllTables } from '../utils/dbReset';
import { signupAndLogin } from '../utils/auth';

describe('MemoBlockController integration', () => {
  let app: INestApplication;
  const testCredentials = { id: 'memoBlockUser', password: 'memoBlockPass123' };
  const testUserAgent = 'jest-supertest-agent';

  let sessionKey: string;
  let memoIdx: number;
  let checklistBlockIdx: number;
  let textBlockIdx: number;

  beforeAll(async () => {
    await truncateAllTables();
    app = await createTestApp();
    sessionKey = await signupAndLogin(app, {
      ...testCredentials,
      userAgent: testUserAgent,
    });

    // 테스트용 메모 생성 (CHECKLIST와 TEXT 블록 포함)
    const createRes = await request(app.getHttpServer())
      .post('/api/memo')
      .set('session-key', sessionKey)
      .set('User-Agent', testUserAgent)
      .send({
        title: '블록 토글 테스트 메모',
        blocks: [
          { orderIndex: 0, type: 'TEXT', content: '텍스트 블록입니다.' },
          { orderIndex: 1, type: 'CHECKLIST', content: '체크리스트 항목 1', checked: false },
          { orderIndex: 2, type: 'CHECKLIST', content: '체크리스트 항목 2', checked: true }
        ]
      });

    memoIdx = createRes.body.idx;
    checklistBlockIdx = createRes.body.blocks.find((b: any) => b.type === 'CHECKLIST' && b.checked === false).idx;
    textBlockIdx = createRes.body.blocks.find((b: any) => b.type === 'TEXT').idx;
  });

  afterAll(async () => {
    // 테스트 메모 정리
    if (memoIdx) {
      await request(app.getHttpServer())
        .delete(`/api/memo/${memoIdx}`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);
    }
    await closeTestApp();
  });

  describe('블록 체크 상태 토글', () => {
    it('CHECKLIST 블록 체크 상태 토글 (false → true)', async () => {
      // 초기 상태 확인 (false)
      const beforeRes = await request(app.getHttpServer())
        .get(`/api/memo/${memoIdx}`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      const beforeBlock = beforeRes.body.blocks.find((b: any) => b.idx === checklistBlockIdx);
      expect(beforeBlock.checked).toBe(false);

      // 토글 실행
      const toggleRes = await request(app.getHttpServer())
        .patch(`/api/memo/${memoIdx}/block/${checklistBlockIdx}/toggle`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(toggleRes.status).toBe(200);
      expect(toggleRes.body.blocks).toBeDefined();

      // 토글 후 상태 확인 (true)
      const afterBlock = toggleRes.body.blocks.find((b: any) => b.idx === checklistBlockIdx);
      expect(afterBlock.checked).toBe(true);

      // DB에서도 확인
      const verifyRes = await request(app.getHttpServer())
        .get(`/api/memo/${memoIdx}`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      const verifyBlock = verifyRes.body.blocks.find((b: any) => b.idx === checklistBlockIdx);
      expect(verifyBlock.checked).toBe(true);
    });

    it('CHECKLIST 블록 체크 상태 토글 (true → false)', async () => {
      // 이미 체크된 블록 찾기
      const memoRes = await request(app.getHttpServer())
        .get(`/api/memo/${memoIdx}`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      const checkedBlock = memoRes.body.blocks.find((b: any) => b.type === 'CHECKLIST' && b.checked === true);
      expect(checkedBlock).toBeDefined();

      // 토글 실행
      const toggleRes = await request(app.getHttpServer())
        .patch(`/api/memo/${memoIdx}/block/${checkedBlock.idx}/toggle`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(toggleRes.status).toBe(200);

      // 토글 후 상태 확인 (false)
      const afterBlock = toggleRes.body.blocks.find((b: any) => b.idx === checkedBlock.idx);
      expect(afterBlock.checked).toBe(false);
    });

    it('여러 번 토글해도 정상 동작', async () => {
      // 첫 번째 토글
      const toggle1Res = await request(app.getHttpServer())
        .patch(`/api/memo/${memoIdx}/block/${checklistBlockIdx}/toggle`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(toggle1Res.status).toBe(200);
      const state1 = toggle1Res.body.blocks.find((b: any) => b.idx === checklistBlockIdx).checked;

      // 두 번째 토글
      const toggle2Res = await request(app.getHttpServer())
        .patch(`/api/memo/${memoIdx}/block/${checklistBlockIdx}/toggle`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(toggle2Res.status).toBe(200);
      const state2 = toggle2Res.body.blocks.find((b: any) => b.idx === checklistBlockIdx).checked;

      // 상태가 반대로 변경되었는지 확인
      expect(state1).not.toBe(state2);
    });

    it('토글 후 전체 메모 정보 반환 확인', async () => {
      const toggleRes = await request(app.getHttpServer())
        .patch(`/api/memo/${memoIdx}/block/${checklistBlockIdx}/toggle`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(toggleRes.status).toBe(200);
      expect(toggleRes.body.idx).toBe(memoIdx);
      expect(toggleRes.body.title).toBe('블록 토글 테스트 메모');
      expect(Array.isArray(toggleRes.body.blocks)).toBe(true);
      expect(toggleRes.body.blocks.length).toBeGreaterThan(0);
    });
  });

  describe('에러 케이스', () => {
    it('TEXT 타입 블록 토글 시 400 에러', async () => {
      const toggleRes = await request(app.getHttpServer())
        .patch(`/api/memo/${memoIdx}/block/${textBlockIdx}/toggle`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(toggleRes.status).toBe(400);
    });

    it('존재하지 않는 메모의 블록 토글 시 404 에러', async () => {
      const toggleRes = await request(app.getHttpServer())
        .patch(`/api/memo/999999/block/${checklistBlockIdx}/toggle`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(toggleRes.status).toBe(404);
    });

    it('존재하지 않는 블록 토글 시 404 에러', async () => {
      const toggleRes = await request(app.getHttpServer())
        .patch(`/api/memo/${memoIdx}/block/999999/toggle`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(toggleRes.status).toBe(404);
    });

    it('다른 사용자의 메모 블록 토글 시 404 에러', async () => {
      // 다른 사용자 생성 및 로그인
      const otherCredentials = { id: 'otherUser', password: 'otherPass123' };
      const otherSessionKey = await signupAndLogin(app, {
        ...otherCredentials,
        userAgent: testUserAgent,
      });

      // 다른 사용자의 메모 생성
      const otherMemoRes = await request(app.getHttpServer())
        .post('/api/memo')
        .set('session-key', otherSessionKey)
        .set('User-Agent', testUserAgent)
        .send({
          title: '다른 사용자 메모',
          blocks: [
            { orderIndex: 0, type: 'CHECKLIST', content: '다른 사용자 체크리스트', checked: false }
          ]
        });

      const otherBlockIdx = otherMemoRes.body.blocks[0].idx;

      // 첫 번째 사용자로 다른 사용자의 블록 토글 시도
      const toggleRes = await request(app.getHttpServer())
        .patch(`/api/memo/${otherMemoRes.body.idx}/block/${otherBlockIdx}/toggle`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(toggleRes.status).toBe(404);

      // 정리
      await request(app.getHttpServer())
        .delete(`/api/memo/${otherMemoRes.body.idx}`)
        .set('session-key', otherSessionKey)
        .set('User-Agent', testUserAgent);
    });

    it('인증 없이 블록 토글 시 401 에러', async () => {
      const toggleRes = await request(app.getHttpServer())
        .patch(`/api/memo/${memoIdx}/block/${checklistBlockIdx}/toggle`)
        .set('User-Agent', testUserAgent);

      expect(toggleRes.status).toBe(401);
    });
  });

  describe('다양한 CHECKLIST 블록 시나리오', () => {
    let testMemoIdx: number;
    let testBlockIdx1: number;
    let testBlockIdx2: number;

    beforeAll(async () => {
      // 새로운 테스트 메모 생성
      const createRes = await request(app.getHttpServer())
        .post('/api/memo')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .send({
          title: '다양한 시나리오 테스트 메모',
          blocks: [
            { orderIndex: 0, type: 'CHECKLIST', content: '항목 1', checked: false },
            { orderIndex: 1, type: 'CHECKLIST', content: '항목 2', checked: false }
          ]
        });

      testMemoIdx = createRes.body.idx;
      testBlockIdx1 = createRes.body.blocks[0].idx;
      testBlockIdx2 = createRes.body.blocks[1].idx;
    });

    afterAll(async () => {
      if (testMemoIdx) {
        await request(app.getHttpServer())
          .delete(`/api/memo/${testMemoIdx}`)
          .set('session-key', sessionKey)
          .set('User-Agent', testUserAgent);
      }
    });

    it('여러 블록을 독립적으로 토글', async () => {
      // 첫 번째 블록 토글
      const toggle1Res = await request(app.getHttpServer())
        .patch(`/api/memo/${testMemoIdx}/block/${testBlockIdx1}/toggle`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(toggle1Res.status).toBe(200);
      const block1 = toggle1Res.body.blocks.find((b: any) => b.idx === testBlockIdx1);
      expect(block1.checked).toBe(true);

      // 두 번째 블록 토글
      const toggle2Res = await request(app.getHttpServer())
        .patch(`/api/memo/${testMemoIdx}/block/${testBlockIdx2}/toggle`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(toggle2Res.status).toBe(200);
      const block2 = toggle2Res.body.blocks.find((b: any) => b.idx === testBlockIdx2);
      expect(block2.checked).toBe(true);

      // 두 블록 모두 체크된 상태 확인
      const verifyRes = await request(app.getHttpServer())
        .get(`/api/memo/${testMemoIdx}`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      const verifyBlock1 = verifyRes.body.blocks.find((b: any) => b.idx === testBlockIdx1);
      const verifyBlock2 = verifyRes.body.blocks.find((b: any) => b.idx === testBlockIdx2);
      expect(verifyBlock1.checked).toBe(true);
      expect(verifyBlock2.checked).toBe(true);
    });

    it('null 상태의 블록 토글 (null → true)', async () => {
      // null 상태의 블록을 가진 메모 생성
      const createRes = await request(app.getHttpServer())
        .post('/api/memo')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .send({
          title: 'null 체크 상태 테스트',
          blocks: [
            { orderIndex: 0, type: 'CHECKLIST', content: 'null 상태 항목' }
          ]
        });

      const nullBlockIdx = createRes.body.blocks[0].idx;

      // 토글 실행 (null → true)
      const toggleRes = await request(app.getHttpServer())
        .patch(`/api/memo/${createRes.body.idx}/block/${nullBlockIdx}/toggle`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(toggleRes.status).toBe(200);
      const toggledBlock = toggleRes.body.blocks.find((b: any) => b.idx === nullBlockIdx);
      expect(toggledBlock.checked).toBe(true);

      // 정리
      await request(app.getHttpServer())
        .delete(`/api/memo/${createRes.body.idx}`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);
    });
  });
});

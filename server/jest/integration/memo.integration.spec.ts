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

  describe('메모 CRUD', () => {
    it('메모 생성 - TEXT 블록', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/memo')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .send({
          title: '첫 번째 메모',
          blocks: [
            { orderIndex: 0, type: 'TEXT', content: '첫 번째 메모입니다.' }
          ]
        });

      expect(createRes.status).toBe(201);
      expect(typeof createRes.body.idx).toBe('number');
      expect(createRes.body.title).toBe('첫 번째 메모');
      expect(createRes.body.blocks).toHaveLength(1);
      expect(createRes.body.blocks[0].type).toBe('TEXT');
      expect(createRes.body.blocks[0].content).toBe('첫 번째 메모입니다.');

      memoIdx = createRes.body.idx;
    });

    it('메모 단건 조회', async () => {
      const detailRes = await request(app.getHttpServer())
        .get(`/api/memo/${memoIdx}`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(detailRes.status).toBe(200);
      expect(detailRes.body.idx).toBe(memoIdx);
      expect(detailRes.body.title).toBe('첫 번째 메모');
      expect(detailRes.body.blocks).toHaveLength(1);
      expect(detailRes.body.blocks[0].content).toBe('첫 번째 메모입니다.');
    });

    it('메모 리스트 조회', async () => {
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
    });

    it('메모 수정', async () => {
      const updateRes = await request(app.getHttpServer())
        .patch(`/api/memo/${memoIdx}`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .send({
          title: '수정된 메모',
          blocks: [
            { orderIndex: 0, type: 'TEXT', content: '수정된 메모입니다.' },
            { orderIndex: 1, type: 'TEXT', content: '두 번째 블록 추가' }
          ]
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.result).toBe(true);

      // 수정된 메모 조회
      const updatedDetailRes = await request(app.getHttpServer())
        .get(`/api/memo/${memoIdx}`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(updatedDetailRes.status).toBe(200);
      expect(updatedDetailRes.body.title).toBe('수정된 메모');
      expect(updatedDetailRes.body.blocks).toHaveLength(2);
      expect(updatedDetailRes.body.blocks[0].content).toBe('수정된 메모입니다.');
      expect(updatedDetailRes.body.blocks[1].content).toBe('두 번째 블록 추가');
    });

    it('메모 삭제', async () => {
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

      // 삭제된 메모는 리스트에 없어야 함
      const deletedMemo = listAfterDeleteRes.body.itemList.find(
        (memo: any) => memo.idx === memoIdx
      );
      expect(deletedMemo).toBeUndefined();
    });
  });

  describe('메모 블록 타입', () => {
    it('CHECKLIST 블록 생성', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/memo')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .send({
          title: '체크리스트 메모',
          blocks: [
            { orderIndex: 0, type: 'CHECKLIST', content: '할 일 1', checked: false },
            { orderIndex: 1, type: 'CHECKLIST', content: '할 일 2', checked: true }
          ]
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.blocks).toHaveLength(2);
      expect(createRes.body.blocks[0].type).toBe('CHECKLIST');
      expect(createRes.body.blocks[0].checked).toBe(false);
      expect(createRes.body.blocks[1].checked).toBe(true);

      // 정리
      await request(app.getHttpServer())
        .delete(`/api/memo/${createRes.body.idx}`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);
    });

    it('혼합 블록 생성 (TEXT + CHECKLIST)', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/memo')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .send({
          title: '혼합 메모',
          blocks: [
            { orderIndex: 0, type: 'TEXT', content: '오늘 할 일 목록' },
            { orderIndex: 1, type: 'CHECKLIST', content: '회의 참석', checked: false },
            { orderIndex: 2, type: 'CHECKLIST', content: '코드 리뷰', checked: false },
            { orderIndex: 3, type: 'TEXT', content: '참고 사항: 점심 후 회의' }
          ]
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.blocks).toHaveLength(4);
      expect(createRes.body.blocks[0].type).toBe('TEXT');
      expect(createRes.body.blocks[1].type).toBe('CHECKLIST');
      expect(createRes.body.blocks[2].type).toBe('CHECKLIST');
      expect(createRes.body.blocks[3].type).toBe('TEXT');

      // 정리
      await request(app.getHttpServer())
        .delete(`/api/memo/${createRes.body.idx}`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);
    });

    it('빈 blocks 배열로 메모 생성', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/memo')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .send({
          title: '빈 블록 메모',
          blocks: []
        });

      expect(createRes.status).toBe(201);
      expect(typeof createRes.body.idx).toBe('number');
      expect(createRes.body.title).toBe('빈 블록 메모');
      expect(createRes.body.blocks).toHaveLength(0);

      // 정리
      await request(app.getHttpServer())
        .delete(`/api/memo/${createRes.body.idx}`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);
    });
  });

  describe('메모 필터링', () => {
    let normalMemoIdx: number;
    let pinnedMemoIdx: number;
    let archivedMemoIdx: number;

    beforeAll(async () => {
      // 일반 메모 생성
      const normalRes = await request(app.getHttpServer())
        .post('/api/memo')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .send({
          title: '일반 메모',
          blocks: [{ orderIndex: 0, type: 'TEXT', content: '일반 메모입니다.' }]
        });
      normalMemoIdx = normalRes.body.idx;

      // 고정 메모 생성
      const pinnedRes = await request(app.getHttpServer())
        .post('/api/memo')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .send({
          title: '고정 메모',
          pinned: true,
          blocks: [{ orderIndex: 0, type: 'TEXT', content: '고정된 메모입니다.' }]
        });
      pinnedMemoIdx = pinnedRes.body.idx;

      // 보관 메모 생성
      const archivedRes = await request(app.getHttpServer())
        .post('/api/memo')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .send({
          title: '보관 메모',
          archived: true,
          blocks: [{ orderIndex: 0, type: 'TEXT', content: '보관된 메모입니다.' }]
        });
      archivedMemoIdx = archivedRes.body.idx;
    });

    afterAll(async () => {
      // 정리
      for (const idx of [normalMemoIdx, pinnedMemoIdx, archivedMemoIdx]) {
        await request(app.getHttpServer())
          .delete(`/api/memo/${idx}`)
          .set('session-key', sessionKey)
          .set('User-Agent', testUserAgent);
      }
    });

    it('일반 메모 목록 조회 (archived=0)', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/api/memo')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .query({ page: 1, count: 10, archived: '0' });

      expect(listRes.status).toBe(200);

      // 보관 메모는 포함되지 않아야 함
      const archivedMemo = listRes.body.itemList.find(
        (memo: any) => memo.idx === archivedMemoIdx
      );
      expect(archivedMemo).toBeUndefined();

      // 일반/고정 메모는 포함되어야 함
      const normalMemo = listRes.body.itemList.find(
        (memo: any) => memo.idx === normalMemoIdx
      );
      const pinnedMemo = listRes.body.itemList.find(
        (memo: any) => memo.idx === pinnedMemoIdx
      );
      expect(normalMemo).toBeDefined();
      expect(pinnedMemo).toBeDefined();
    });

    it('보관 메모 목록 조회 (archived=1)', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/api/memo')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .query({ page: 1, count: 10, archived: '1' });

      expect(listRes.status).toBe(200);

      // 보관 메모만 포함되어야 함
      const archivedMemo = listRes.body.itemList.find(
        (memo: any) => memo.idx === archivedMemoIdx
      );
      expect(archivedMemo).toBeDefined();

      // 일반/고정 메모는 포함되지 않아야 함
      const normalMemo = listRes.body.itemList.find(
        (memo: any) => memo.idx === normalMemoIdx
      );
      const pinnedMemo = listRes.body.itemList.find(
        (memo: any) => memo.idx === pinnedMemoIdx
      );
      expect(normalMemo).toBeUndefined();
      expect(pinnedMemo).toBeUndefined();
    });

    it('고정 메모가 상단에 정렬됨', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/api/memo')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .query({ page: 1, count: 10, archived: '0' });

      expect(listRes.status).toBe(200);

      // 고정 메모가 일반 메모보다 앞에 있어야 함
      const pinnedIndex = listRes.body.itemList.findIndex(
        (memo: any) => memo.idx === pinnedMemoIdx
      );
      const normalIndex = listRes.body.itemList.findIndex(
        (memo: any) => memo.idx === normalMemoIdx
      );

      expect(pinnedIndex).toBeLessThan(normalIndex);
    });
  });

  describe('메모 검색', () => {
    let searchMemoIdx: number;

    beforeAll(async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/memo')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .send({
          title: '검색 테스트 메모',
          blocks: [
            { orderIndex: 0, type: 'TEXT', content: '유니크한키워드ABC 검색용 메모입니다.' }
          ]
        });
      searchMemoIdx = createRes.body.idx;
    });

    afterAll(async () => {
      await request(app.getHttpServer())
        .delete(`/api/memo/${searchMemoIdx}`)
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);
    });

    it('블록 content로 검색', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/api/memo')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .query({ page: 1, count: 10, search: '유니크한키워드ABC' });

      expect(listRes.status).toBe(200);
      expect(listRes.body.itemList.length).toBeGreaterThanOrEqual(1);

      const foundMemo = listRes.body.itemList.find(
        (memo: any) => memo.idx === searchMemoIdx
      );
      expect(foundMemo).toBeDefined();
    });

    it('존재하지 않는 키워드 검색', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/api/memo')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent)
        .query({ page: 1, count: 10, search: '존재하지않는키워드XYZ123' });

      expect(listRes.status).toBe(200);
      expect(listRes.body.itemList).toHaveLength(0);
    });
  });

  describe('에러 케이스', () => {
    it('존재하지 않는 메모 조회 시 404', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/memo/999999')
        .set('session-key', sessionKey)
        .set('User-Agent', testUserAgent);

      expect(res.status).toBe(400);
    });

    it('인증 없이 메모 조회 시 401', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/memo')
        .set('User-Agent', testUserAgent);

      expect(res.status).toBe(401);
    });
  });
});

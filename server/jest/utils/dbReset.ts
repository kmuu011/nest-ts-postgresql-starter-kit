import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function truncateAllTables() {
  try {
    // 외래키 제약조건 임시 해제
    await prisma.$executeRawUnsafe('SET session_replication_role = replica;');

    // 모든 테이블 데이터 삭제
    await prisma.memoBlock.deleteMany({});
    await prisma.file.deleteMany({});
    await prisma.memo.deleteMany({});
    await prisma.member.deleteMany({});

    // 시퀀스 초기화
    await prisma.$executeRawUnsafe('ALTER SEQUENCE "Member_idx_seq" RESTART WITH 1;');
    await prisma.$executeRawUnsafe('ALTER SEQUENCE "Memo_idx_seq" RESTART WITH 1;');
    await prisma.$executeRawUnsafe('ALTER SEQUENCE "MemoBlock_idx_seq" RESTART WITH 1;');
    await prisma.$executeRawUnsafe('ALTER SEQUENCE "File_idx_seq" RESTART WITH 1;');

    // 외래키 제약조건 재활성화
    await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;');
  } catch (error) {
    console.error('Error truncating tables:', error);
    throw error;
  }
}

export async function disconnectDB() {
  await prisma.$disconnect();
}

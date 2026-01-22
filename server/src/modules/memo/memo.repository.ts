import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { Memo, MemoBlock, Prisma } from "@prisma/client";
import { PgroongaUtility } from "../../utils/PgroongaUtility";

export type MemoWithBlocks = Memo & { blocks: MemoBlock[] };

@Injectable()
export class MemoRepository {
  constructor(private prisma: PrismaService) { }

  async create(data: Prisma.MemoCreateInput): Promise<MemoWithBlocks> {
    return this.prisma.db.memo.create({
      data,
      include: {
        blocks: {
          orderBy: { orderIndex: 'asc' },
          include: {
            file: {
              select: {
                fileKey: true,
                fileName: true,
                fileType: true,
                fileCategory: true,
                fileSize: true,
              }
            }
          }
        }
      }
    });
  }

  async selectOne(
    memberIdx: number,
    idx: number
  ): Promise<MemoWithBlocks | null> {
    return this.prisma.db.memo.findUnique({
      where: { memberIdx, idx },
      include: {
        blocks: {
          orderBy: { orderIndex: 'asc' },
          include: {
            file: {
              select: {
                fileKey: true,
                fileName: true,
                fileType: true,
                fileCategory: true,
                fileSize: true,
              }
            }
          }
        }
      }
    });
  }

  async selectList(
    memberIdx: number,
    page: number,
    count: number,
    keyword?: string,
    archived?: boolean
  ): Promise<MemoWithBlocks[]> {
    const whereSql = Prisma.sql`
      WHERE m."memberIdx" = ${memberIdx}
      ${archived !== undefined ? Prisma.sql`AND m."archived" = ${archived}` : Prisma.sql``}
      ${keyword
        ? Prisma.sql`
          AND EXISTS (
            SELECT 1 FROM "MemoBlock" mb
            WHERE mb."memoIdx" = m."idx"
            ${PgroongaUtility.createSearchCondition(keyword, "content", "mb")}
          )
        `
        : Prisma.sql``
      }
    `;

    const sql = Prisma.sql`
      SELECT m."idx", m."memberIdx", m."title", m."pinned", m."archived", m."createdAt", m."updatedAt"
      FROM "Memo" m
      ${whereSql}
      ORDER BY m."pinned" DESC, m."idx" DESC
      LIMIT ${count} OFFSET ${(page - 1) * count}
    `;

    const memos = await this.prisma.db.$queryRaw<Memo[]>(sql);

    if (memos.length === 0) {
      return [];
    }

    const memoIdxList = memos.map(memo => memo.idx);

    const blocks = await this.prisma.db.memoBlock.findMany({
      where: {
        memoIdx: { in: memoIdxList }
      },
      orderBy: { orderIndex: 'asc' },
      include: {
        file: {
          select: {
            fileKey: true,
            fileName: true,
            fileType: true,
            fileCategory: true,
            fileSize: true,
          }
        }
      }
    });

    // 메모와 블록을 조합
    const blocksByMemoIdx = blocks.reduce((acc, block) => {
      if (!acc[block.memoIdx]) {
        acc[block.memoIdx] = [];
      }
      acc[block.memoIdx].push(block);
      return acc;
    }, {} as Record<number, MemoBlock[]>);

    return memos.map(memo => ({
      ...memo,
      blocks: blocksByMemoIdx[memo.idx] || []
    }));
  }

  async selectCount(
    memberIdx: number,
    keyword?: string,
    archived?: boolean
  ): Promise<number> {
    const whereSql = Prisma.sql`
      WHERE m."memberIdx" = ${memberIdx}
      ${archived !== undefined ? Prisma.sql`AND m."archived" = ${archived}` : Prisma.sql``}
      ${keyword
        ? Prisma.sql`
          AND EXISTS (
            SELECT 1 FROM "MemoBlock" mb
            WHERE mb."memoIdx" = m."idx"
            ${PgroongaUtility.createSearchCondition(keyword, "content", "mb")}
          )
        `
        : Prisma.sql``
      }
    `;

    const countSql = Prisma.sql`
      SELECT LEAST(COUNT(*), 2147483647)::int AS "totalCount"
      FROM "Memo" m
      ${whereSql}
    `;

    const totalCountResult = await this.prisma.db.$queryRaw<{ totalCount: number }[]>(countSql);
    return totalCountResult[0].totalCount;
  }

  async update(params: {
    where: Prisma.MemoWhereUniqueInput;
    data: Prisma.MemoUpdateInput;
  }): Promise<MemoWithBlocks> {
    const { where, data } = params;
    return this.prisma.db.memo.update({
      where,
      data,
      include: {
        blocks: {
          orderBy: { orderIndex: 'asc' },
          include: {
            file: {
              select: {
                fileKey: true,
                fileName: true,
                fileType: true,
                fileCategory: true,
                fileSize: true,
              }
            }
          }
        }
      }
    });
  }

  async delete(where: Prisma.MemoWhereUniqueInput): Promise<Memo> {
    return this.prisma.db.memo.delete({
      where,
    });
  }

  async selectFileIdxListByMemo(
    memberIdx: number,
    memoIdx: number
  ): Promise<number[]> {
    const blocks = await this.prisma.db.memoBlock.findMany({
      where: {
        memoIdx,
        memo: { memberIdx },
        fileIdx: { not: null }
      },
      select: { fileIdx: true }
    });

    return blocks.map(block => block.fileIdx!);
  }
}

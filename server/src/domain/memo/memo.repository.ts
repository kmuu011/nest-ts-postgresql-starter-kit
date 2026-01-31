import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { Memo, Prisma } from "@prisma/client";

@Injectable()
export class MemoRepository {
  constructor(private prisma: PrismaService) { }

  async create(data: Prisma.MemoCreateInput): Promise<Memo> {
    return this.prisma.db.memo.create({
      data,
    });
  }

  async selectOne(
    memberIdx: number,
    idx: number
  ): Promise<Memo | null> {
    return this.prisma.db.memo.findUnique({
      where: { memberIdx, idx },
    });
  }

  async selectList(
    memberIdx: number,
    page: number,
    count: number,
    keyword?: string,
    archived?: boolean
  ): Promise<Memo[]> {
    const whereSql = Prisma.sql`
      WHERE m."memberIdx" = ${memberIdx}
      ${archived !== undefined ? Prisma.sql`AND m."archived" = ${archived}` : Prisma.sql``}
      ${keyword
        ? Prisma.sql`AND (m."content"::text &@ ${keyword} OR m."title" &@ ${keyword})`
        : Prisma.sql``
      }
    `;

    const sql = Prisma.sql`
      SELECT m."idx", m."memberIdx", m."title", m."content", m."pinned", m."archived", m."createdAt", m."updatedAt"
      FROM "Memo" m
      ${whereSql}
      ORDER BY m."pinned" DESC, m."idx" DESC
      LIMIT ${count} OFFSET ${(page - 1) * count}
    `;

    return await this.prisma.db.$queryRaw<Memo[]>(sql);
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
        ? Prisma.sql`AND (m."content"::text &@ ${keyword} OR m."title" &@ ${keyword})`
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
  }): Promise<Memo> {
    const { where, data } = params;
    return this.prisma.db.memo.update({
      where,
      data,
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
    const files = await this.prisma.db.file.findMany({
      where: {
        memoIdx,
        memo: { memberIdx }
      },
      select: { idx: true }
    });

    return files.map(file => file.idx);
  }
}

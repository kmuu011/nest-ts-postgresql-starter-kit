import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
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
    searchKeywordList: string[],
    skip?: number,
    take?: number
  ): Promise<Memo[]> {
    const sql = Prisma.sql`
      SELECT * 
      FROM "Memo"
      WHERE "memberIdx" = ${memberIdx}
      ${searchKeywordList?.length > 0
        ? Prisma.sql`AND (${Prisma.join(searchKeywordList.map((kw) => Prisma.sql`"memo" &@ ${kw}`), ` AND `)})`
        : Prisma.sql``
      }

      ORDER BY "idx" DESC
      LIMIT ${take}
      OFFSET ${skip}
    `;

    return (await this.prisma.db.$queryRaw(sql)) as Memo[];
  }

  async selectCount(
    memberIdx: number,
    searchKeywordList: string[],
  ): Promise<number> {
    const sql = Prisma.sql`
      SELECT LEAST(COUNT(*), 2147483647)::int AS "totalCount"
      FROM "Memo"
      WHERE "memberIdx" = ${memberIdx}
      ${searchKeywordList?.length > 0
        ? Prisma.sql`AND (${Prisma.join(searchKeywordList.map((kw) => Prisma.sql`"memo" &@ ${kw}`), ` AND `)})`
        : Prisma.sql``
      }
    `;

    const totalCountResult = await this.prisma.db.$queryRaw(sql) as any[];
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
}

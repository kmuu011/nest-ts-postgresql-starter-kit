import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { File, Prisma } from "@prisma/client";

@Injectable()
export class FileRepository {
  constructor(private prisma: PrismaService) { }

  async create(data: Prisma.FileCreateInput): Promise<File> {
    return this.prisma.db.file.create({
      data,
    });
  }

  async selectOne(
    memberIdx: number,
    idx: number
  ): Promise<File | null> {
    return this.prisma.db.file.findFirst({
      where: {
        idx,
        memo: {
          memberIdx
        }
      },
    });
  }

  async selectList(
    memberIdx: number,
    searchKeywordList: string[],
    skip?: number,
    take?: number
  ): Promise<File[]> {
    const sql = Prisma.sql`
      SELECT f.*
      FROM "File" f
      INNER JOIN "Memo" m ON f."memoIdx" = m."idx"
      WHERE m."memberIdx" = ${memberIdx}
      ${searchKeywordList?.length > 0
        ? Prisma.sql`AND (${Prisma.join(searchKeywordList.map((kw) => Prisma.sql`f."fileName" &@ ${kw}`), ` AND `)})`
        : Prisma.sql``
      }
      ORDER BY f."idx" DESC
      LIMIT ${take}
      OFFSET ${skip}
    `;

    return (await this.prisma.db.$queryRaw(sql)) as File[];
  }

  async selectCount(
    memberIdx: number,
    searchKeywordList: string[],
  ): Promise<number> {
    const sql = Prisma.sql`
      SELECT LEAST(COUNT(*), 2147483647)::int AS "totalCount"
      FROM "File" f
      INNER JOIN "Memo" m ON f."memoIdx" = m."idx"
      WHERE m."memberIdx" = ${memberIdx}
      ${searchKeywordList?.length > 0
        ? Prisma.sql`AND (${Prisma.join(searchKeywordList.map((kw) => Prisma.sql`f."fileName" &@ ${kw}`), ` AND `)})`
        : Prisma.sql``
      }
    `;

    const totalCountResult = await this.prisma.db.$queryRaw(sql) as any[];
    return totalCountResult[0].totalCount;
  }

  async delete(where: { idx: number }): Promise<File> {
    return this.prisma.db.file.delete({
      where,
    });
  }

  async isUsedInMemo(fileIdx: number): Promise<boolean> {
    const file = await this.prisma.db.file.findFirst({
      where: { idx: fileIdx },
      select: { memoIdx: true }
    });

    return file !== null && file.memoIdx !== null;
  }

  async findByFileKey(fileKey: string): Promise<File | null> {
    return this.prisma.db.file.findUnique({
      where: { fileKey }
    });
  }

  async updateMemoIdx(fileKey: string, memoIdx: number): Promise<File> {
    return this.prisma.db.file.update({
      where: { fileKey },
      data: { memoIdx }
    });
  }
}

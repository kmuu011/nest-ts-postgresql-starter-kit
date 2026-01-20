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
    return this.prisma.db.file.findUnique({
      where: { memberIdx, idx },
    });
  }

  async selectList(
    memberIdx: number,
    searchKeywordList: string[],
    skip?: number,
    take?: number
  ): Promise<File[]> {
    const sql = Prisma.sql`
      SELECT *
      FROM "File"
      WHERE "memberIdx" = ${memberIdx}
      ${searchKeywordList?.length > 0
        ? Prisma.sql`AND (${Prisma.join(searchKeywordList.map((kw) => Prisma.sql`"fileName" &@ ${kw}`), ` AND `)})`
        : Prisma.sql``
      }

      ORDER BY "idx" DESC
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
      FROM "File"
      WHERE "memberIdx" = ${memberIdx}
      ${searchKeywordList?.length > 0
        ? Prisma.sql`AND (${Prisma.join(searchKeywordList.map((kw) => Prisma.sql`"fileName" &@ ${kw}`), ` AND `)})`
        : Prisma.sql``
      }
    `;

    const totalCountResult = await this.prisma.db.$queryRaw(sql) as any[];
    return totalCountResult[0].totalCount;
  }

  async delete(where: Prisma.FileWhereUniqueInput): Promise<File> {
    return this.prisma.db.file.delete({
      where,
    });
  }
}

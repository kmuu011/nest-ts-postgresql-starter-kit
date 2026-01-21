import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { Memo, MemoBlock, Prisma } from "@prisma/client";

export type MemoWithBlocks = Memo & { blocks: MemoBlock[] };

@Injectable()
export class MemoRepository {
  constructor(private prisma: PrismaService) { }

  async create(data: Prisma.MemoCreateInput): Promise<MemoWithBlocks> {
    return this.prisma.db.memo.create({
      data,
      include: {
        blocks: {
          orderBy: { orderIndex: 'asc' }
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
          orderBy: { orderIndex: 'asc' }
        }
      }
    });
  }

  async selectList(
    memberIdx: number,
    searchKeywordList: string[],
    skip?: number,
    take?: number,
    archived?: boolean
  ): Promise<MemoWithBlocks[]> {
    const where: Prisma.MemoWhereInput = {
      memberIdx,
      ...(archived !== undefined && { archived }),
    };

    // 검색어가 있으면 블록 content 검색
    if (searchKeywordList?.length > 0) {
      where.blocks = {
        some: {
          OR: searchKeywordList.map(kw => ({
            content: {
              contains: kw
            }
          }))
        }
      };
    }

    return this.prisma.db.memo.findMany({
      where,
      include: {
        blocks: {
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: [
        { pinned: 'desc' },
        { idx: 'desc' }
      ],
      skip,
      take
    });
  }

  async selectCount(
    memberIdx: number,
    searchKeywordList: string[],
    archived?: boolean
  ): Promise<number> {
    const where: Prisma.MemoWhereInput = {
      memberIdx,
      ...(archived !== undefined && { archived }),
    };

    // 검색어가 있으면 블록 content 검색
    if (searchKeywordList?.length > 0) {
      where.blocks = {
        some: {
          OR: searchKeywordList.map(kw => ({
            content: {
              contains: kw
            }
          }))
        }
      };
    }

    return this.prisma.db.memo.count({ where });
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
          orderBy: { orderIndex: 'asc' }
        }
      }
    });
  }

  async delete(where: Prisma.MemoWhereUniqueInput): Promise<Memo> {
    return this.prisma.db.memo.delete({
      where,
    });
  }
}

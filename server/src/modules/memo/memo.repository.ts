import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { Memo, Prisma } from "@prisma/client";

@Injectable()
export class MemoRepository {
  constructor(private prisma: PrismaService) { }

  async create(data: Prisma.MemoCreateInput): Promise<Memo> {
    return this.prisma.memo.create({
      data,
    });
  }

  async selectOne(
    memberIdx: number,
    idx: number
  ): Promise<Memo | null> {
    return this.prisma.memo.findUnique({
      where: { memberIdx, idx },
    });
  }

  async selectList(
    where?: Prisma.MemoWhereInput,
    skip?: number,
    take?: number
  ): Promise<Memo[]> {
    return this.prisma.memo.findMany({
      where,
      orderBy: {
        idx: 'desc',
      },
      skip,
      take,
    });
  }

  async selectCount(where?: Prisma.MemoWhereInput): Promise<number> {
    return this.prisma.memo.count({
      where,
    });
  }

  async update(params: {
    where: Prisma.MemoWhereUniqueInput;
    data: Prisma.MemoUpdateInput;
  }): Promise<Memo> {
    const { where, data } = params;
    return this.prisma.memo.update({
      where,
      data,
    });
  }

  async delete(where: Prisma.MemoWhereUniqueInput): Promise<Memo> {
    return this.prisma.memo.delete({
      where,
    });
  }
}

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { MemoBlock, Prisma } from "@prisma/client";

@Injectable()
export class MemoBlockRepository {
  constructor(private prisma: PrismaService) { }

  async selectBlock(
    memberIdx: number,
    memoIdx: number,
    blockIdx: number
  ): Promise<MemoBlock | null> {
    return this.prisma.db.memoBlock.findFirst({
      where: {
        idx: blockIdx,
        memoIdx,
        memo: { memberIdx }
      }
    });
  }

  async updateBlock(
    blockIdx: number,
    data: Prisma.MemoBlockUpdateInput
  ): Promise<MemoBlock> {
    return this.prisma.db.memoBlock.update({
      where: { idx: blockIdx },
      data
    });
  }
}

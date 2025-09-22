import { Injectable } from '@nestjs/common';
import { MemoRepository } from './memo.repository';
import { Memo, Prisma } from '@prisma/client';
import { BaseService } from 'src/common/base/base.service';
import { PaginatedServiceData } from 'src/types/common';
import { Message } from 'src/utils/MessageUtility';
import { keyDescriptionObj } from 'src/constants/keyDescriptionObj';
import { SaveMemoDto } from './dto/saveMemo.dto';

@Injectable()
export class MemoService extends BaseService {
  constructor(
    private readonly memoRepository: MemoRepository
  ) {
    super();
  }

  async selectList(
    memberIdx: number,
    page: number,
    count: number,
    search: string
  ): Promise<PaginatedServiceData<Memo>> {
    let searchKeywordList: string[] = [];

    if (search) {
      searchKeywordList = search
        .trim()
        .split(' ')
        .filter(keyword => keyword !== '');
    }

    const memoList = await this.memoRepository.selectList(
      memberIdx,
      searchKeywordList,
      (page - 1) * count,
      count
    );

    const memoCount = await this.memoRepository.selectCount(
      memberIdx,
      searchKeywordList
    );

    return this.returnListType({
      itemList: memoList,
      page: 1,
      count: 10,
      totalCount: memoCount
    });
  }

  async selectOne(
    memberIdx: number,
    memoIdx: number
  ): Promise<Memo | null> {
    const memo = await this.memoRepository.selectOne(
      memberIdx,
      memoIdx
    );

    if (!memo) {
      throw Message.NOT_EXIST(keyDescriptionObj.memo);
    }

    return memo;
  }

  async create(
    memberIdx: number,
    saveMemoDto: SaveMemoDto
  ): Promise<Memo> {
    const memo = await this.memoRepository.create({
      ...saveMemoDto,
      member: { connect: { idx: memberIdx } },
    });
    return memo;
  }

  async update(
    memberIdx: number,
    memoIdx: number,
    saveMemoDto: SaveMemoDto
  ): Promise<Memo> {
    const updatedMemo = await this.memoRepository.update({
      where: {
        idx: memoIdx,
        memberIdx
      },
      data: {
        ...saveMemoDto,
      },
    });

    return updatedMemo;
  }

  async delete(
    memberIdx: number,
    memoIdx: number
  ): Promise<Boolean> {
    await this.memoRepository.delete({
      idx: memoIdx,
      memberIdx
    });

    return true;
  }

}

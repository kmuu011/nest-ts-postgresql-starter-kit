import { Injectable } from '@nestjs/common';
import { MemoRepository, MemoWithBlocks } from './memo.repository';
import { BaseService } from 'src/common/base/base.service';
import { PaginatedServiceData } from 'src/types/common';
import { Message } from 'src/utils/MessageUtility';
import { keyDescriptionObj } from 'src/constants/keyDescriptionObj';
import { SaveMemoDto } from './dto/saveMemo.dto';
import { FileService } from '../file/file.service';

@Injectable()
export class MemoService extends BaseService {
  constructor(
    private readonly memoRepository: MemoRepository,
    private readonly fileService: FileService
  ) {
    super();
  }

  async selectList(
    memberIdx: number,
    page: number,
    count: number,
    search: string,
    archived?: boolean
  ): Promise<PaginatedServiceData<MemoWithBlocks>> {
    const keyword = search?.trim() || undefined;

    const memoList = await this.memoRepository.selectList(
      memberIdx,
      page,
      count,
      keyword,
      archived
    );

    const memoCount = await this.memoRepository.selectCount(
      memberIdx,
      keyword,
      archived
    );

    return this.returnListType({
      itemList: memoList,
      page,
      count,
      totalCount: memoCount
    });
  }

  async selectOne(
    memberIdx: number,
    memoIdx: number
  ): Promise<MemoWithBlocks | null> {
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
  ): Promise<MemoWithBlocks> {
    const { blocks, ...memoData } = saveMemoDto;

    const memo = await this.memoRepository.create({
      ...memoData,
      member: { connect: { idx: memberIdx } },
      blocks: {
        create: blocks.map(block => ({
          orderIndex: block.orderIndex,
          type: block.type,
          content: block.content,
          checked: block.checked,
          ...(block.fileIdx && { file: { connect: { idx: block.fileIdx } } }),
          displayWidth: block.displayWidth,
          displayHeight: block.displayHeight,
        }))
      }
    });
    
    return memo;
  }

  async update(
    memberIdx: number,
    memoIdx: number,
    saveMemoDto: SaveMemoDto
  ): Promise<MemoWithBlocks> {
    const { blocks, ...memoData } = saveMemoDto;

    // 기존 블록 모두 삭제 후 새로 생성 (간단한 방식)
    const updatedMemo = await this.memoRepository.update({
      where: {
        idx: memoIdx,
        memberIdx
      },
      data: {
        ...memoData,
        blocks: {
          deleteMany: {},
          create: blocks.map(block => ({
            orderIndex: block.orderIndex,
            type: block.type,
            content: block.content,
            checked: block.checked,
            ...(block.fileIdx && { file: { connect: { idx: block.fileIdx } } }),
            displayWidth: block.displayWidth,
            displayHeight: block.displayHeight,
          }))
        }
      },
    });

    return updatedMemo;
  }

  async delete(
    memberIdx: number,
    memoIdx: number
  ): Promise<Boolean> {
    // 메모에 연결된 파일 idx 목록 조회
    const fileIdxList = await this.memoRepository.selectFileIdxListByMemo(memberIdx, memoIdx);

    // 메모 삭제 (MemoBlock은 cascade로 삭제됨)
    await this.memoRepository.delete({
      idx: memoIdx,
      memberIdx
    });

    // 연결되어 있던 파일들 삭제 (DB + 스토리지, 사용 중 체크 스킵)
    for (const fileIdx of fileIdxList) {
      await this.fileService.delete(memberIdx, fileIdx, true);
    }

    return true;
  }
}


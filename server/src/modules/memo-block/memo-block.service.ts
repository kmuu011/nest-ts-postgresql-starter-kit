import { Injectable } from '@nestjs/common';
import { MemoBlockRepository } from './memo-block.repository';
import { MemoRepository, MemoWithBlocks } from '../memo/memo.repository';
import { BaseService } from 'src/common/base/base.service';
import { Message } from 'src/utils/MessageUtility';
import { keyDescriptionObj } from 'src/constants/keyDescriptionObj';

@Injectable()
export class MemoBlockService extends BaseService {
  constructor(
    private readonly memoBlockRepository: MemoBlockRepository,
    private readonly memoRepository: MemoRepository
  ) {
    super();
  }

  async toggleBlockChecked(
    memberIdx: number,
    memoIdx: number,
    blockIdx: number
  ): Promise<MemoWithBlocks> {
    // 메모 소유권 확인
    const memo = await this.memoRepository.selectOne(memberIdx, memoIdx);
    if (!memo) {
      throw Message.NOT_EXIST(keyDescriptionObj.memo);
    }

    // 블록 존재 및 소유권 확인
    const block = await this.memoBlockRepository.selectBlock(memberIdx, memoIdx, blockIdx);
    if (!block) {
      throw Message.NOT_EXIST('블록');
    }

    // CHECKLIST 타입인지 확인
    if (block.type !== 'CHECKLIST') {
      throw Message.CUSTOM_ERROR('CHECKLIST 타입의 블록만 체크 상태를 변경할 수 있습니다.');
    }

    // checked 상태 토글
    const newCheckedValue = block.checked === null || block.checked === false ? true : false;
    await this.memoBlockRepository.updateBlock(blockIdx, {
      checked: newCheckedValue
    });

    // 업데이트된 메모 반환
    return await this.memoRepository.selectOne(memberIdx, memoIdx) as MemoWithBlocks;
  }
}

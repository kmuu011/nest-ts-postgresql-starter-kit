import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { Message } from 'src/utils/MessageUtility';
import { keyDescriptionObj } from 'src/constants/keyDescriptionObj';
import { MemoRepository } from '../memo/memo.repository';
import { MemoBlockRepository } from './memo-block.repository';

@Injectable()
export class MemoBlockGuard implements CanActivate {
  constructor(
    private readonly memoRepository: MemoRepository,
    private readonly memoBlockRepository: MemoBlockRepository,
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const memberIdx = Number(req.memberInfo!.idx);
    const memoIdx = Number(req.params.memoIdx);
    const blockIdx = Number(req.params.blockIdx);

    // 메모 소유권 확인
    const memo = await this.memoRepository.selectOne(
      memberIdx,
      memoIdx
    );

    if (!memo) throw Message.NOT_EXIST(keyDescriptionObj.memo);

    // 블록 소유권 확인
    const block = await this.memoBlockRepository.selectBlock(
      memberIdx,
      memoIdx,
      blockIdx
    );

    if (!block) throw Message.NOT_EXIST('블록');

    req.memoInfo = memo;
    req.blockInfo = block;

    return true;
  }
}

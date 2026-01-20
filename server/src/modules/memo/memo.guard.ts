import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { Message } from 'src/utils/MessageUtility';
import { keyDescriptionObj } from 'src/constants/keyDescriptionObj';
import { MemoRepository } from './memo.repository';

@Injectable()
export class MemoGuard implements CanActivate {
  constructor(
    private readonly memoRepository: MemoRepository,
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const memberIdx = Number(req.memberInfo!.idx);
    const memoIdx = Number(req.params.memoIdx);

    const memo = await this.memoRepository.selectOne(
      memberIdx,
      memoIdx
    );

    if (!memo) throw Message.NOT_EXIST(keyDescriptionObj.memo);

    req.memoInfo = memo;

    return true;
  }
}

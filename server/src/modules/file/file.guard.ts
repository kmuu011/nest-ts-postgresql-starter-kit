import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { Message } from 'src/utils/MessageUtility';
import { keyDescriptionObj } from 'src/constants/keyDescriptionObj';
import { FileRepository } from './file.repository';

@Injectable()
export class FileGuard implements CanActivate {
  constructor(
    private readonly fileRepository: FileRepository,
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const memberIdx = Number(req.memberInfo!.idx);
    const fileIdx = Number(req.params.fileIdx);

    const file = await this.fileRepository.selectOne(
      memberIdx,
      fileIdx
    );

    if (!file) throw Message.NOT_EXIST(keyDescriptionObj.file);

    req.fileInfo = file;

    return true;
  }
}

import { Module } from '@nestjs/common';
import { MemoService } from './memo.service';
import { MemoController } from './memo.controller';
import { MemoRepository } from './memo.repository';

@Module({
  controllers: [MemoController],
  providers: [MemoService, MemoRepository],
  exports: [],
})

export class MemoModule { }

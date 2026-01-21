import { Module } from '@nestjs/common';
import { MemoService } from './memo.service';
import { MemoController } from './memo.controller';
import { MemoBlockController } from '../memo-block/memo-block.controller';
import { MemoBlockService } from '../memo-block/memo-block.service';
import { MemoBlockRepository } from '../memo-block/memo-block.repository';
import { MemoBlockGuard } from '../memo-block/memo-block.guard';
import { MemoRepository } from './memo.repository';
import { FileModule } from '../file/file.module';

@Module({
  imports: [FileModule],
  controllers: [MemoController, MemoBlockController],
  providers: [MemoService, MemoRepository, MemoBlockService, MemoBlockRepository, MemoBlockGuard],
  exports: [],
})

export class MemoModule { }

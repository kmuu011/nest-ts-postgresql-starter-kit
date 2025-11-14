import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { FileRepository } from './file.repository';

@Module({
  controllers: [FileController],
  providers: [FileService, FileRepository],
  exports: [],
})

export class FileModule { }

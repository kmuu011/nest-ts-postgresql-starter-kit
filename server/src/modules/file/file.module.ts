import { Module } from '@nestjs/common';
import { FileService } from '@/domain/file/file.service';
import { FileController } from './file.controller';
import { FileRepository } from '@/domain/file/file.repository';

@Module({
  controllers: [FileController],
  providers: [FileService, FileRepository],
  exports: [FileService, FileRepository],
})

export class FileModule { }

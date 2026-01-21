import { Injectable } from '@nestjs/common';
import { FileRepository } from './file.repository';
import { File } from '@prisma/client';
import { BaseService } from 'src/common/base/base.service';
import { PaginatedServiceData } from 'src/types/common';
import { Message } from 'src/utils/MessageUtility';
import { keyDescriptionObj } from 'src/constants/keyDescriptionObj';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { KeyUtility } from 'src/utils/KeyUtility';
import { config } from 'src/config';
import * as fs from 'fs';
import * as path from 'path';
import { UploadedFile } from './file.interface';

@Injectable()
export class FileService extends BaseService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly prisma: PrismaService
  ) {
    super();
  }

  async selectList(
    memberIdx: number,
    page: number,
    count: number,
    search: string
  ): Promise<PaginatedServiceData<File>> {
    let searchKeywordList: string[] = [];

    if (search) {
      searchKeywordList = search
        .trim()
        .split(' ')
        .filter(keyword => keyword !== '');
    }

    const fileList = await this.fileRepository.selectList(
      memberIdx,
      searchKeywordList,
      (page - 1) * count,
      count
    );

    const fileCount = await this.fileRepository.selectCount(
      memberIdx,
      searchKeywordList
    );

    return this.returnListType({
      itemList: fileList,
      page,
      count,
      totalCount: fileCount
    });
  }

  async selectOne(
    memberIdx: number,
    fileIdx: number
  ): Promise<File | null> {
    const file = await this.fileRepository.selectOne(
      memberIdx,
      fileIdx
    );

    if (!file) {
      throw Message.NOT_EXIST(keyDescriptionObj.file);
    }

    return file;
  }

  async upload(
    memberIdx: number,
    files: UploadedFile[]
  ): Promise<File[]> {
    const uploadedFiles: File[] = [];

    for (const file of files) {
      const fileType = path.extname(file.originalname).substring(1).toLowerCase();
      const fileName = path.basename(file.originalname, path.extname(file.originalname));
      const fileMimeType = file.mimetype;

      // Generate unique file key
      const fileKey = await KeyUtility.createKey({
        prisma: this.prisma,
        tableName: 'file',
        columnKey: 'fileKey',
        path: config.filePath.file + '/',
        includeDate: true,
        suffixText: `.${fileType}`
      });

      // Ensure directory exists
      const uploadDir = path.join(config.staticPath, config.filePath.file);
      KeyUtility.ensureDirectoryExists(uploadDir);

      // Save file to disk
      const filePath = path.join(config.staticPath, fileKey);
      fs.writeFileSync(filePath, file.buffer);

      // Create database record
      const createdFile = await this.fileRepository.create({
        fileKey,
        fileName,
        fileType,
        fileMimeType,
        fileSize: BigInt(file.size),
        member: { connect: { idx: memberIdx } },
      });

      uploadedFiles.push(createdFile);
    }

    return uploadedFiles;
  }

  async delete(
    memberIdx: number,
    fileIdx: number,
    skipInUseCheck: boolean = false
  ): Promise<Boolean> {
    const file = await this.fileRepository.selectOne(memberIdx, fileIdx);

    if (!file) {
      throw Message.NOT_EXIST(keyDescriptionObj.file);
    }

    // 메모에서 사용 중인지 확인 (skipInUseCheck가 true면 건너뜀 - 메모 삭제 시 호출)
    if (!skipInUseCheck) {
      const isUsed = await this.fileRepository.isUsedInMemoBlock(fileIdx);
      if (isUsed) {
        throw Message.IN_USE(keyDescriptionObj.file);
      }
    }

    // Delete physical file
    const filePath = path.join(config.staticPath, file.fileKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.fileRepository.delete({
      idx: fileIdx,
      memberIdx
    });

    return true;
  }

}

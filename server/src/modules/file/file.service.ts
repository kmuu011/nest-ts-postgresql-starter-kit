import { Injectable } from '@nestjs/common';
import { FileRepository } from './file.repository';
import { File } from '@prisma/client';
import { BaseService } from 'src/common/base/base.service';
import { PaginatedServiceData } from 'src/types/common';
import { Message } from 'src/utils/MessageUtility';
import { keyDescriptionObj } from 'src/constants/keyDescriptionObj';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { FileUtility } from 'src/utils/FileUtility';
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
    files: UploadedFile[],
    memoIdx?: number
  ): Promise<File[]> {
    const uploadedFiles: File[] = [];

    for (const file of files) {
      // 파일 정보 추출
      const { fileType, fileName, fileMimeType } = FileUtility.extractFileInfo(
        file.originalname,
        file.mimetype
      );
      
      // FileCategory 결정
      const fileCategory = FileUtility.determineFileCategory(fileMimeType, fileType);

      // 파일을 디스크에 저장
      const fileKey = await FileUtility.saveFileToDisk(file, this.prisma);

      // Create database record
      const createData: any = {
        fileKey,
        fileName,
        fileType,
        fileMimeType,
        fileSize: BigInt(file.size),
        fileCategory,
      };

      // memoIdx가 있으면 연결, 없으면 null
      if (memoIdx) {
        createData.memo = { connect: { idx: memoIdx } };
      }

      const createdFile = await this.fileRepository.create(createData);

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
      const isUsed = await this.fileRepository.isUsedInMemo(fileIdx);
      if (isUsed) {
        throw Message.IN_USE(keyDescriptionObj.file);
      }
    }

    // Delete physical file
    FileUtility.deleteFileFromDisk(file.fileKey);

    await this.fileRepository.delete({
      idx: fileIdx
    });

    return true;
  }

}

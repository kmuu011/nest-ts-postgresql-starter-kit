import { FileCategory } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'src/config';
import { KeyUtility } from './KeyUtility';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UploadedFile } from 'src/modules/file/file.type';

export class FileUtility {
  /**
   * MIME type과 확장자를 기반으로 FileCategory 결정
   */
  static determineFileCategory(mimeType: string, extension: string): FileCategory {
    const mimeLower = mimeType.toLowerCase();
    const extLower = extension.toLowerCase();

    // IMAGE 카테고리
    if (mimeLower.startsWith('image/')) {
      return FileCategory.IMAGE;
    }

    // VIDEO 카테고리
    if (mimeLower.startsWith('video/')) {
      return FileCategory.VIDEO;
    }

    // AUDIO 카테고리
    if (mimeLower.startsWith('audio/')) {
      return FileCategory.AUDIO;
    }

    // DOCUMENT 카테고리
    const documentMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument',
      'application/vnd.ms-excel',
      'application/vnd.ms-powerpoint',
      'text/',
      'application/rtf',
      'application/vnd.oasis.opendocument',
    ];
    
    const documentExtensions = [
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
      'txt', 'rtf', 'odt', 'ods', 'odp', 'csv'
    ];

    if (documentMimeTypes.some(type => mimeLower.startsWith(type)) ||
        documentExtensions.includes(extLower)) {
      return FileCategory.DOCUMENT;
    }

    // 기본값: OTHER
    return FileCategory.OTHER;
  }

  /**
   * 파일 정보 추출 (확장자, 파일명, MIME type)
   * 파일명 인코딩 문제 해결 (한글 등)
   */
  static extractFileInfo(originalname: string, mimetype: string): {
    fileType: string;
    fileName: string;
    fileMimeType: string;
  } {
    // 파일명 디코딩 처리 (한글 등 멀티바이트 문자 지원)
    let decodedName = originalname;
    
    try {
      // URL 인코딩된 경우 디코딩
      decodedName = decodeURIComponent(originalname);
    } catch (e) {
      // 디코딩 실패 시 원본 사용
      decodedName = originalname;
    }

    // ISO-8859-1로 잘못 인코딩된 경우 UTF-8로 변환 시도
    try {
      const buffer = Buffer.from(decodedName, 'latin1');
      if (buffer.toString('utf8') !== decodedName) {
        decodedName = buffer.toString('utf8');
      }
    } catch (e) {
      // 변환 실패 시 그대로 사용
    }

    const fileType = path.extname(decodedName).substring(1).toLowerCase();
    const fileName = path.basename(decodedName, path.extname(decodedName));
    
    return {
      fileType,
      fileName,
      fileMimeType: mimetype,
    };
  }

  /**
   * 파일을 디스크에 저장
   * @returns 생성된 fileKey
   */
  static async saveFileToDisk(
    file: UploadedFile,
    prisma: PrismaService
  ): Promise<string> {
    const fileType = path.extname(file.originalname).substring(1).toLowerCase();

    // Generate unique file key
    const fileKey = await KeyUtility.createKey({
      prisma,
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

    return fileKey;
  }

  /**
   * 디스크에서 파일 삭제
   */
  static deleteFileFromDisk(fileKey: string): void {
    const filePath = path.join(config.staticPath, fileKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

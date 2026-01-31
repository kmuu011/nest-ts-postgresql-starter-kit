import { Controller, Delete, Get, HttpCode, Post, Query, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@/common/guard/auth/auth.guard';
import { BaseController } from '@/common/base/base.controller';
import { FileService } from '@/domain/file/file.service';
import type { Request, Response } from 'express';
import { FileGuard } from '@/common/guard/file/file.guard';
import { config } from '@/config';
import * as path from 'path';
import * as fs from 'fs';
import { Message } from '@/common/utils/MessageUtility';
import { keyDescriptionObj } from '@/common/constants/keyDescriptionObj';
import { PaginationQueryDto } from '@/common/dto/common/pagination-query.dto';
import { UploadedFile } from './file.type';
import { SESSION_KEY } from '@/common/constants/session';
import { httpStatus } from '@/common/constants/httpStatus';

@ApiTags('File')
@ApiSecurity(SESSION_KEY)
@UseGuards(AuthGuard)
@Controller('file')
export class FileController extends BaseController {
  constructor(
    private readonly fileService: FileService
  ) {
    super();
  }

  @Get("/")
  @HttpCode(httpStatus.OK)
  @ApiOperation({ summary: '파일 목록 조회', description: '페이징 및 검색 지원' })
  @ApiResponse({ status: httpStatus.OK, description: '파일 목록 조회 성공' })
  async getFileList(
    @Req() req: Request,
    @Query() query: PaginationQueryDto,
  ) {
    const memberIdx = req.memberInfo!.idx;
    const fileList = await this.fileService.selectList(
      memberIdx,
      query.page,
      query.count,
      query.search
    );

    return fileList;
  }

  @Post("/upload")
  @HttpCode(httpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 10, {
    preservePath: true,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
  }))
  @ApiOperation({ summary: '파일 업로드', description: '실제 파일을 서버에 업로드하고 DB에 저장 (최대 50MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({ status: httpStatus.CREATED, description: '파일 업로드 성공' })
  @ApiResponse({ status: httpStatus.BAD_REQUEST, description: '파일이 없거나 잘못된 요청' })
  @ApiResponse({ status: httpStatus.PAYLOAD_TOO_LARGE, description: '파일 크기 초과 (최대 50MB)' })
  async uploadFile(
    @UploadedFiles() files: UploadedFile[],
    @Req() req: Request,
  ) {
    if (!files || files.length === 0) {
      throw Message.INVALID_PARAM(keyDescriptionObj.file);
    }

    return await this.fileService.upload(files);
  }

  @Post("/:fileIdx/download")
  @HttpCode(httpStatus.OK)
  @UseGuards(FileGuard)
  @ApiOperation({ summary: '파일 다운로드', description: '파일을 다운로드합니다' })
  @ApiParam({ name: 'fileIdx', type: Number, description: '파일 ID' })
  @ApiResponse({ status: httpStatus.OK, description: '파일 다운로드 성공' })
  @ApiResponse({ status: httpStatus.NOT_FOUND, description: '파일을 찾을 수 없음' })
  async downloadFile(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const fileInfo = req.fileInfo!;
    const filePath = path.join(config.staticPath, fileInfo.fileKey);

    if (!fs.existsSync(filePath)) {
      throw Message.NOT_EXIST(keyDescriptionObj.file);
    }

    res.download(
      filePath,
      `${fileInfo.fileName}.${fileInfo.fileType}`,
      (err) => {
        if (err && !res.headersSent) {
          console.log(err);
          throw Message.SERVER_ERROR;
        }
      }
    );
  }

  @Delete("/:fileIdx")
  @HttpCode(httpStatus.OK)
  @UseGuards(FileGuard)
  @ApiOperation({ summary: '파일 삭제', description: '물리 파일과 DB 레코드 모두 삭제' })
  @ApiParam({ name: 'fileIdx', type: Number, description: '파일 ID' })
  @ApiResponse({ status: httpStatus.OK, description: '파일 삭제 성공' })
  @ApiResponse({ status: httpStatus.NOT_FOUND, description: '파일을 찾을 수 없음' })
  async deleteFile(
    @Req() req: Request
  ) {
    const fileIdx = req.fileInfo!.idx;
    const memberIdx = req.memberInfo!.idx;

    await this.fileService.delete(memberIdx, fileIdx);
    return this.sendSuccess();
  }
}

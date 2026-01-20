import { Controller, Delete, Get, Post, Query, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from 'src/guard/auth.guard';
import { BaseController } from 'src/common/base/base.controller';
import { FileService } from './file.service';
import type { Request, Response } from 'express';
import { FileGuard } from './file.guard';
import { config } from 'src/config';
import * as path from 'path';
import * as fs from 'fs';
import { Message } from 'src/utils/MessageUtility';
import { keyDescriptionObj } from 'src/constants/keyDescriptionObj';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { UploadedFile } from './file.interface';

@ApiTags('File')
@ApiSecurity('session-key')
@UseGuards(AuthGuard)
@Controller('file')
export class FileController extends BaseController {
  constructor(
    private readonly fileService: FileService
  ) {
    super();
  }

  @Get("/")
  @ApiOperation({ summary: '파일 목록 조회', description: '페이징 및 검색 지원' })
  @ApiResponse({ status: 200, description: '파일 목록 조회 성공' })
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
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: '파일 업로드', description: '실제 파일을 서버에 업로드하고 DB에 저장' })
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
  @ApiResponse({ status: 201, description: '파일 업로드 성공' })
  @ApiResponse({ status: 400, description: '파일이 없거나 잘못된 요청' })
  async uploadFile(
    @UploadedFiles() files: UploadedFile[],
    @Req() req: Request,
  ) {
    const memberIdx = req.memberInfo!.idx;

    if (!files || files.length === 0) {
      throw Message.INVALID_PARAM(keyDescriptionObj.file);
    }

    return await this.fileService.upload(memberIdx, files);
  }

  @Post("/:fileIdx/download")
  @UseGuards(FileGuard)
  @ApiOperation({ summary: '파일 다운로드', description: '파일을 다운로드합니다' })
  @ApiParam({ name: 'fileIdx', type: Number, description: '파일 ID' })
  @ApiResponse({ status: 200, description: '파일 다운로드 성공' })
  @ApiResponse({ status: 404, description: '파일을 찾을 수 없음' })
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
  @UseGuards(FileGuard)
  @ApiOperation({ summary: '파일 삭제', description: '물리 파일과 DB 레코드 모두 삭제' })
  @ApiParam({ name: 'fileIdx', type: Number, description: '파일 ID' })
  @ApiResponse({ status: 200, description: '파일 삭제 성공' })
  @ApiResponse({ status: 404, description: '파일을 찾을 수 없음' })
  async deleteFile(
    @Req() req: Request
  ) {
    const fileIdx = req.fileInfo!.idx;
    const memberIdx = req.memberInfo!.idx;

    await this.fileService.delete(memberIdx, fileIdx);
    return this.sendSuccess();
  }
}

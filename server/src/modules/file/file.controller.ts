import { Body, Controller, DefaultValuePipe, Delete, Get, ParseIntPipe, Post, Query, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/guard/auth.guard';
import { SaveFileDto } from './dto/saveFile.dto';
import { BaseController } from 'src/common/base/base.controller';
import { FileService } from './file.service';
import type { Request, Response } from 'express';
import { FileGuard } from './file.guard';
import { config } from 'src/config';
import * as path from 'path';
import * as fs from 'fs';
import { Message } from 'src/utils/MessageUtility';
import { keyDescriptionObj } from 'src/constants/keyDescriptionObj';

@UseGuards(AuthGuard)
@Controller('file')
export class FileController extends BaseController {
  constructor(
    private readonly fileService: FileService
  ) {
    super();
  }

  @Get("/")
  async getFileList(
    @Req() req: Request,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('count', new DefaultValuePipe(10), ParseIntPipe) count: number,
    @Query('search', new DefaultValuePipe('')) search: string,
  ) {
    page = Math.max(page, 1);
    count = Math.min(Math.max(1, count), 10);

    const memberIdx = req.memberInfo!.idx;
    const fileList = await this.fileService.selectList(
      memberIdx,
      page,
      count,
      search
    );

    return fileList;
  }

  @Post("/")
  async createFile(
    @Body() saveFileDto: SaveFileDto,
    @Req() req: Request,
  ) {
    const memberIdx = req.memberInfo!.idx;

    return await this.fileService.create(memberIdx, saveFileDto);
  }

  @Post("/upload")
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFile(
    @UploadedFiles() files: any[],
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
  async deleteFile(
    @Req() req: Request
  ) {
    const fileIdx = req.fileInfo!.idx;
    const memberIdx = req.memberInfo!.idx;

    await this.fileService.delete(memberIdx, fileIdx);
    return this.sendSuccess();
  }
}

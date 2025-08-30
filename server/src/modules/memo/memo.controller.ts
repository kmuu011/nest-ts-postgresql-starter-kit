import { Body, Controller, DefaultValuePipe, Delete, Get, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guard/auth.guard';
import { SaveMemoDto } from './dto/saveMemo.dto';
import { BaseController } from 'src/common/base/base.controller';
import { MemoService } from './memo.service';
import type { Request } from 'express';
import { MemoGuard } from './memo.guard';

@UseGuards(AuthGuard)
@Controller('memo')
export class MemoController extends BaseController {
  constructor(
    private readonly memoService: MemoService
  ) {
    super();
  }

  @Get("/")
  async getMemoList(
    @Req() req: Request,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('count', new DefaultValuePipe(10), ParseIntPipe) count: number,
    @Query('search', new DefaultValuePipe('')) search: string,
  ) {
    page = Math.max(page, 1);
    count = Math.min(Math.max(1, count), 10);

    const memberIdx = req.memberInfo!.idx;
    const memoList = await this.memoService.selectList(
      memberIdx,
      page,
      count,
      search
    );

    return memoList;
  }

  @Post("/")
  async createMemo(
    @Body() saveMemoDto: SaveMemoDto,
    @Req() req: Request,
  ) {
    const memberIdx = req.memberInfo!.idx;

    return await this.memoService.create(memberIdx, saveMemoDto);
  }

  @Get("/:memoIdx")
  @UseGuards(MemoGuard)
  async selectOne(@Req() req: Request) {

    return req.memoInfo;
  }

  @Patch("/:memoIdx")
  @UseGuards(MemoGuard)
  async updateMemo(
    @Req() req: Request,
    @Body() saveMemoDto: SaveMemoDto
  ) {
    const memoIdx = req.memoInfo!.idx;
    const memberIdx = req.memberInfo!.idx;

    await this.memoService.update(
      memberIdx,
      memoIdx,
      saveMemoDto
    );

    return this.sendSuccess();
  }

  @Delete("/:memoIdx")
  @UseGuards(MemoGuard)
  async deleteMemo(
    @Req() req: Request
  ) {
    const memoIdx = req.memoInfo!.idx;
    const memberIdx = req.memberInfo!.idx;

    await this.memoService.delete(memberIdx, memoIdx);
    return this.sendSuccess();
  }
}

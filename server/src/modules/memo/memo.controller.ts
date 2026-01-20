import { Body, Controller, Delete, Get, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from 'src/guard/auth.guard';
import { SaveMemoDto } from './dto/saveMemo.dto';
import { BaseController } from 'src/common/base/base.controller';
import { MemoService } from './memo.service';
import type { Request } from 'express';
import { MemoGuard } from './memo.guard';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@ApiTags('Memo')
@ApiSecurity('session-key')
@UseGuards(AuthGuard)
@Controller('memo')
export class MemoController extends BaseController {
  constructor(
    private readonly memoService: MemoService
  ) {
    super();
  }

  @Get("/")
  @ApiOperation({ summary: '메모 목록 조회', description: '페이징 및 검색 지원' })
  @ApiResponse({ status: 200, description: '메모 목록 조회 성공' })
  async getMemoList(
    @Req() req: Request,
    @Query() query: PaginationQueryDto,
  ) {
    const memberIdx = req.memberInfo!.idx;
    const memoList = await this.memoService.selectList(
      memberIdx,
      query.page,
      query.count,
      query.search
    );

    return memoList;
  }

  @Post("/")
  @ApiOperation({ summary: '메모 생성', description: '새로운 메모 작성' })
  @ApiResponse({ status: 201, description: '메모 생성 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async createMemo(
    @Body() saveMemoDto: SaveMemoDto,
    @Req() req: Request,
  ) {
    const memberIdx = req.memberInfo!.idx;

    return await this.memoService.create(memberIdx, saveMemoDto);
  }

  @Get("/:memoIdx")
  @UseGuards(MemoGuard)
  @ApiOperation({ summary: '메모 단건 조회', description: '특정 메모 상세 조회' })
  @ApiParam({ name: 'memoIdx', type: Number, description: '메모 ID' })
  @ApiResponse({ status: 200, description: '메모 조회 성공' })
  @ApiResponse({ status: 404, description: '메모를 찾을 수 없음' })
  async selectOne(@Req() req: Request) {

    return req.memoInfo;
  }

  @Patch("/:memoIdx")
  @UseGuards(MemoGuard)
  @ApiOperation({ summary: '메모 수정', description: '메모 내용 수정' })
  @ApiParam({ name: 'memoIdx', type: Number, description: '메모 ID' })
  @ApiResponse({ status: 200, description: '메모 수정 성공' })
  @ApiResponse({ status: 404, description: '메모를 찾을 수 없음' })
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
  @ApiOperation({ summary: '메모 삭제', description: '메모 삭제' })
  @ApiParam({ name: 'memoIdx', type: Number, description: '메모 ID' })
  @ApiResponse({ status: 200, description: '메모 삭제 성공' })
  @ApiResponse({ status: 404, description: '메모를 찾을 수 없음' })
  async deleteMemo(
    @Req() req: Request
  ) {
    const memoIdx = req.memoInfo!.idx;
    const memberIdx = req.memberInfo!.idx;

    await this.memoService.delete(memberIdx, memoIdx);
    return this.sendSuccess();
  }
}

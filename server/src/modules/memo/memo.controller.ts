import { Body, Controller, Delete, Get, HttpCode, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@/common/guard/auth/auth.guard';
import { SaveMemoDto } from './dto/saveMemo.dto';
import { BaseController } from '@/common/base/base.controller';
import { MemoService } from '@/domain/memo/memo.service';
import type { Request } from 'express';
import { MemoGuard } from '@/common/guard/memo/memo.guard';
import { GetMemoListDto } from './dto/getMemoList.dto';
import { SESSION_KEY } from '@/common/constants/session';
import { httpStatus } from '@/common/constants/httpStatus';

@ApiTags('Memo')
@ApiSecurity(SESSION_KEY)
@UseGuards(AuthGuard)
@Controller('memo')
export class MemoController extends BaseController {
  constructor(
    private readonly memoService: MemoService
  ) {
    super();
  }

  @Get("/")
  @HttpCode(httpStatus.OK)
  @ApiOperation({
    summary: '메모 목록 조회',
    description: '페이징 및 검색 지원. archived=0(일반), archived=1(보관함). pinned 메모는 자동으로 상단 정렬'
  })
  @ApiResponse({ status: httpStatus.OK, description: '메모 목록 조회 성공' })
  async getMemoList(
    @Req() req: Request,
    @Query() query: GetMemoListDto,
  ) {
    const memberIdx = req.memberInfo!.idx;
    const archivedFilter = query.archived === '1' ? true : query.archived === '0' ? false : undefined;

    const memoList = await this.memoService.selectList(
      memberIdx,
      query.page,
      query.count,
      query.search,
      archivedFilter
    );

    return memoList;
  }

  @Post("/")
  @HttpCode(httpStatus.CREATED)
  @ApiOperation({
    summary: '메모 생성',
    description: `새로운 메모 작성`
  })
  @ApiResponse({ status: httpStatus.CREATED, description: '메모 생성 성공' })
  @ApiResponse({ status: httpStatus.BAD_REQUEST, description: '잘못된 요청' })
  async createMemo(
    @Body() saveMemoDto: SaveMemoDto,
    @Req() req: Request,
  ) {
    const memberIdx = req.memberInfo!.idx;

    return await this.memoService.create(memberIdx, saveMemoDto);
  }

  @Get("/:memoIdx")
  @HttpCode(httpStatus.OK)
  @UseGuards(MemoGuard)
  @ApiOperation({ summary: '메모 단건 조회', description: '특정 메모 상세 조회' })
  @ApiParam({ name: 'memoIdx', type: Number, description: '메모 ID' })
  @ApiResponse({ status: httpStatus.OK, description: '메모 조회 성공' })
  @ApiResponse({ status: httpStatus.NOT_FOUND, description: '메모를 찾을 수 없음' })
  async selectOne(@Req() req: Request) {

    return req.memoInfo;
  }

  @Patch("/:memoIdx")
  @HttpCode(httpStatus.OK)
  @UseGuards(MemoGuard)
  @ApiOperation({ summary: '메모 수정', description: '메모 내용 수정' })
  @ApiParam({ name: 'memoIdx', type: Number, description: '메모 ID' })
  @ApiResponse({ status: httpStatus.OK, description: '메모 수정 성공' })
  @ApiResponse({ status: httpStatus.NOT_FOUND, description: '메모를 찾을 수 없음' })
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
  @HttpCode(httpStatus.OK)
  @UseGuards(MemoGuard)
  @ApiOperation({ summary: '메모 삭제', description: '메모 삭제' })
  @ApiParam({ name: 'memoIdx', type: Number, description: '메모 ID' })
  @ApiResponse({ status: httpStatus.OK, description: '메모 삭제 성공' })
  @ApiResponse({ status: httpStatus.NOT_FOUND, description: '메모를 찾을 수 없음' })
  async deleteMemo(
    @Req() req: Request
  ) {
    const memoIdx = req.memoInfo!.idx;
    const memberIdx = req.memberInfo!.idx;

    await this.memoService.delete(memberIdx, memoIdx);
    return this.sendSuccess();
  }
}

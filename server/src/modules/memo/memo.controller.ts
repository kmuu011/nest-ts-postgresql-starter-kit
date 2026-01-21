import { Body, Controller, Delete, Get, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from 'src/guard/auth.guard';
import { SaveMemoDto } from './dto/saveMemo.dto';
import { BaseController } from 'src/common/base/base.controller';
import { MemoService } from './memo.service';
import type { Request } from 'express';
import { MemoGuard } from './memo.guard';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { SESSION_KEY } from 'src/constants/session';

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
  @ApiOperation({
    summary: '메모 목록 조회',
    description: '페이징 및 검색 지원. archived=0(일반), archived=1(보관함). pinned 메모는 자동으로 상단 정렬'
  })
  @ApiResponse({ status: 200, description: '메모 목록 조회 성공' })
  async getMemoList(
    @Req() req: Request,
    @Query() query: PaginationQueryDto,
    @Query('archived') archived?: string,
  ) {
    const memberIdx = req.memberInfo!.idx;
    const archivedFilter = archived === '1' ? true : archived === '0' ? false : undefined;

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
  @ApiOperation({
    summary: '메모 생성',
    description: `새로운 메모 작성

블록 타입:
- TEXT: 일반 텍스트 (content 필드 사용)
- CHECKLIST: 체크리스트 (content에 JSON 문자열)
- IMAGE: 이미지 (fileIdx, displayWidth, displayHeight 사용)
- VIDEO: 비디오 (fileIdx, displayWidth, displayHeight, videoDurationMs 사용)

예시:
{
  "title": "오늘 할 일",
  "blocks": [
    { "orderIndex": 0, "type": "TEXT", "content": "간단한 메모" }
  ]
}`
  })
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

import { Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from 'src/guard/auth.guard';
import { BaseController } from 'src/common/base/base.controller';
import { MemoBlockService } from './memo-block.service';
import type { Request } from 'express';
import { MemoBlockGuard } from './memo-block.guard';
import { SESSION_KEY } from 'src/constants/session';

@ApiTags('Memo Block')
@ApiSecurity(SESSION_KEY)
@UseGuards(AuthGuard)
@Controller('memo')
export class MemoBlockController extends BaseController {
  constructor(
    private readonly memoBlockService: MemoBlockService
  ) {
    super();
  }

  @Patch("/:memoIdx/block/:blockIdx/toggle")
  @UseGuards(MemoBlockGuard)
  @ApiOperation({ 
    summary: '블록 체크 상태 토글', 
    description: 'CHECKLIST 타입 블록의 checked 상태를 토글합니다. true ↔ false' 
  })
  @ApiParam({ name: 'memoIdx', type: Number, description: '메모 ID' })
  @ApiParam({ name: 'blockIdx', type: Number, description: '블록 ID' })
  @ApiResponse({ status: 200, description: '블록 체크 상태 토글 성공' })
  @ApiResponse({ status: 404, description: '메모 또는 블록을 찾을 수 없음' })
  @ApiResponse({ status: 400, description: 'CHECKLIST 타입이 아님' })
  async toggleBlockChecked(
    @Req() req: Request
  ) {
    const memoIdx = req.memoInfo!.idx;
    const memberIdx = req.memberInfo!.idx;
    const blockIdx = Number(req.params.blockIdx);

    const updatedMemo = await this.memoBlockService.toggleBlockChecked(
      memberIdx,
      memoIdx,
      blockIdx
    );

    return updatedMemo;
  }
}

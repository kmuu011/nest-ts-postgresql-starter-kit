import { IsInt, IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested, IsBoolean, Length } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class MemoBlockDto {
  @ApiProperty({
    description: '블록 순서',
    example: 0
  })
  @IsInt()
  orderIndex: number;

  @ApiProperty({
    description: '블록 타입',
    example: 'TEXT',
    enum: ['TEXT', 'CHECKLIST', 'IMAGE', 'VIDEO']
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({
    description: '텍스트 또는 체크리스트 내용 (순수 문자열)',
    example: '메모 내용'
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: '체크 여부 (CHECKLIST 타입일 때만 사용)',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  checked?: boolean;

  @ApiPropertyOptional({
    description: '파일 ID (IMAGE/VIDEO 타입일 때만 사용)',
    example: 123
  })
  @IsOptional()
  @IsInt()
  fileIdx?: number;

  @ApiPropertyOptional({
    description: '표시 너비 (IMAGE/VIDEO)',
    example: 800
  })
  @IsOptional()
  @IsInt()
  displayWidth?: number;

  @ApiPropertyOptional({
    description: '표시 높이 (IMAGE/VIDEO)',
    example: 600
  })
  @IsOptional()
  @IsInt()
  displayHeight?: number;

  @ApiPropertyOptional({
    description: '비디오 길이 (VIDEO만)',
    example: 30000
  })
  @IsOptional()
  @IsInt()
  videoDurationMs?: number;
}

export class SaveMemoDto {
  @ApiPropertyOptional({
    description: '메모 제목 (선택)',
    example: '오늘 할 일'
  })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  title?: string;

  @ApiPropertyOptional({
    description: '고정 여부 (선택, 기본값: false)',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @ApiPropertyOptional({
    description: '보관 여부 (선택, 기본값: false)',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  archived?: boolean;

  @ApiProperty({
    description: '메모 블록 리스트 (최소 1개 이상)',
    type: [MemoBlockDto],
    examples: {
      textOnly: {
        summary: '텍스트만',
        value: [
          { orderIndex: 0, type: 'TEXT', content: '간단한 메모입니다' }
        ]
      },
      withChecklist: {
        summary: '텍스트 + 체크리스트',
        value: [
          { orderIndex: 0, type: 'TEXT', content: '오늘 할 일' },
          { orderIndex: 1, type: 'CHECKLIST', content: '프로젝트 완료', checked: false },
          { orderIndex: 2, type: 'CHECKLIST', content: '리뷰 요청', checked: false }
        ]
      },
      withImage: {
        summary: '텍스트 + 이미지',
        value: [
          { orderIndex: 0, type: 'TEXT', content: '스크린샷 첨부' },
          { orderIndex: 1, type: 'IMAGE', fileIdx: 1, displayWidth: 800, displayHeight: 600 }
        ]
      }
    }
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemoBlockDto)
  blocks: MemoBlockDto[];
}

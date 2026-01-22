import { IsOptional, IsString, IsArray, ValidateNested, IsBoolean, Length } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { MemoBlockDto } from "@/modules/memo-block/dto/memo-block.dto";

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
    description: '메모 블록 리스트',
    type: [MemoBlockDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemoBlockDto)
  blocks: MemoBlockDto[];
}

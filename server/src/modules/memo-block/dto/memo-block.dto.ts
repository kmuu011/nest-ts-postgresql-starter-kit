import { IsInt, IsOptional, IsString, IsBoolean, IsEnum } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MemoBlockType } from "@prisma/client";

export class MemoBlockDto {
  @ApiProperty({
    description: '블록 순서',
    example: 0
  })
  @IsInt()
  orderIndex: number;

  @ApiProperty({
    description: '블록 타입',
    example: MemoBlockType.TEXT,
    enum: MemoBlockType
  })
  @IsEnum(MemoBlockType, { message: 'type must be one of: TEXT, CHECKLIST, FILE' })
  type: MemoBlockType;

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
    description: '파일 ID (FILE 타입일 때만 사용)',
    example: 123
  })
  @IsOptional()
  @IsInt()
  fileIdx?: number;

  @ApiPropertyOptional({
    description: '표시 너비 (FILE 타입일 때 사용)',
    example: 800
  })
  @IsOptional()
  @IsInt()
  displayWidth?: number;

  @ApiPropertyOptional({
    description: '표시 높이 (FILE 타입일 때 사용)',
    example: 600
  })
  @IsOptional()
  @IsInt()
  displayHeight?: number;
}

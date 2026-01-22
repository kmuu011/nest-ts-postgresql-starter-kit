import { IsOptional, IsString, IsBoolean, Length, IsObject } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

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
    description: '메모 내용 (JSON 형식, 선택)',
    example: { 
      root: {
        children: [],
        type: "root",
        version: 1
      }
    }
  })
  @IsOptional()
  @IsObject()
  content?: any;

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
}

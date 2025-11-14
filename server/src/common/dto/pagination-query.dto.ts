import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    required: false,
    default: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 10,
    required: false,
    default: 10,
    minimum: 1,
    maximum: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  count: number = 10;

  @ApiProperty({
    description: '검색 키워드',
    example: '',
    required: false,
    default: ''
  })
  @IsOptional()
  @IsString()
  search: string = '';
}

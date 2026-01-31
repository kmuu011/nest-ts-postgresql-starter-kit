import { IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@/common/dto/common/pagination-query.dto';

export class GetMemoListDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: '보관함 필터',
    example: '0',
    enum: ['0', '1'],
    enumName: 'ArchivedFilter',
    required: false,
    default: '0'
  })
  @IsOptional()
  @IsIn(['0', '1'])
  archived?: string = '0';
}

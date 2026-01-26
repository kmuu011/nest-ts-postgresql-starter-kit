import { IsString, Length, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthCredentialsDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 'qa1',
    minLength: 3,
    maxLength: 30
  })
  @IsString()
  @Length(3, 30)
  id: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'qa1',
    minLength: 3,
    maxLength: 30
  })
  @IsString()
  @Length(3, 30)
  password: string;

  @ApiPropertyOptional({
    description: '로그인 유지 여부',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  keepLogin?: boolean;
}

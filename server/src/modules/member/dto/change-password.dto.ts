import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: '현재 비밀번호',
    example: 'currentPassword123',
    minLength: 3,
    maxLength: 30
  })
  @IsString()
  @Length(3, 30)
  currentPassword: string;

  @ApiProperty({
    description: '새 비밀번호',
    example: 'newPassword123',
    minLength: 3,
    maxLength: 30
  })
  @IsString()
  @Length(3, 30)
  newPassword: string;
}

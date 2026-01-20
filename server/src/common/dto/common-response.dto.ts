import { ApiProperty } from "@nestjs/swagger";

export class SuccessResponseDto {
  @ApiProperty({
    description: '성공 여부',
    example: true
  })
  result: boolean;
}

export class LoginResponseDto {
  @ApiProperty({
    description: '세션 키',
    example: 'abc123def456'
  })
  sessionKey: string;
}

export class DuplicateCheckResponseDto {
  @ApiProperty({
    description: '중복 여부',
    example: false
  })
  isDuplicated: boolean;
}

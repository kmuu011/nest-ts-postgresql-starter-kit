import { IsNotEmpty, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SaveMemoDto {
  @ApiProperty({
    description: '메모 내용',
    example: '오늘 할 일: 프로젝트 완료하기',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  memo: string;
}
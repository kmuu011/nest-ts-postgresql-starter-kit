import { IsIn, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { duplicateCheckType } from "../member.type";
import type { DuplicateCheckKey } from '../member.type';


export class DuplicateCheckDto {
  @ApiProperty({
    description: '중복 체크할 필드',
    example: 'id',
    enum: duplicateCheckType
  })
  @IsIn(duplicateCheckType)
  key: DuplicateCheckKey;

  @ApiProperty({
    description: '중복 체크할 값',
    example: 'testuser'
  })
  @IsString()
  @IsNotEmpty()
  value: string;
}
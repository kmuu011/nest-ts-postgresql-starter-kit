import {IsIn, IsNotEmpty, IsString} from "class-validator";
import {duplicateCheckType} from "../member.type";
import type { DuplicateCheckKey } from '../member.type';


export class DuplicateCheckDto {
  @IsIn(duplicateCheckType)
  key: DuplicateCheckKey;

  @IsString()
  @IsNotEmpty()
  value: string;
}
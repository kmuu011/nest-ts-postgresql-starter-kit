import { IsNotEmpty, IsString, Length } from "class-validator";

export class SaveMemoDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  memo: string;
}
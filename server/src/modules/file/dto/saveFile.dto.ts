import { IsNotEmpty, IsString, Length, IsNumber } from "class-validator";

export class SaveFileDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  fileKey: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 45)
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 15)
  fileType: string;

  @IsNumber()
  @IsNotEmpty()
  fileSize: number;
}

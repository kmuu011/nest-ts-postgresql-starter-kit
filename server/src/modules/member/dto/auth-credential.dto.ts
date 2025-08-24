import { IsString, Length } from 'class-validator';

export class AuthCredentialsDto {
  @IsString()
  @Length(3, 30)
  id: string;

  @IsString()
  @Length(3, 30)
  password: string;
}

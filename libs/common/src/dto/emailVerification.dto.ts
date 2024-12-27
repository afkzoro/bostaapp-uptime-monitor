import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class verifyUserRequest {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

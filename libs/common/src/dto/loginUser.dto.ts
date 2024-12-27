import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class loginUserRequest {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  password: string;
}

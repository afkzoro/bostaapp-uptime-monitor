import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  registerUserRequest,
  ResponseWithStatus,
  verifyUserRequest,
} from '@app/common';

@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async register(
    @Body() request: registerUserRequest,
  ): Promise<ResponseWithStatus> {
    return this.usersService.register(request);
  }

  @Post('verify')
  async verify(
    @Body() request: verifyUserRequest,
  ): Promise<{ message: string }> {
    return this.usersService.verifyEmail(request);
  }

  @Get('resend-verification/:email')
  async resendVerification(@Param('email') email: string) {
    return this.usersService.resendVerification(email);
  }
}

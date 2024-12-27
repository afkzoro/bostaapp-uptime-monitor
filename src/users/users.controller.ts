import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { registerUserRequest, ResponseWithStatus } from '@app/common';

@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async register(
    @Body() request: registerUserRequest,
  ): Promise<ResponseWithStatus> {
    return this.usersService.register(request);
  }
}

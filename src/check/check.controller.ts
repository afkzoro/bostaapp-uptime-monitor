import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CheckService } from './check.service';
import { Check, CreateCheckDto, CurrentUser, User } from '@app/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('check')
export class CheckController {
  constructor(private checkService: CheckService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createCheck(
    @Body() checkDto: CreateCheckDto,
    @CurrentUser() user: User,
  ): Promise<Check> {
    return await this.checkService.createCheck(user._id.toString(), checkDto);
  }
}

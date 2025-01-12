import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CheckService } from './check.service';
import {
  Check,
  CreateCheckDto,
  CurrentUser,
  UpdateCheckDto,
  User,
} from '@app/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { MonitoringService } from 'src/monitoring/monitoring.service';

@Controller('check')
@UseGuards(JwtAuthGuard)
export class CheckController {
  constructor(
    private checkService: CheckService,
    private monitoringService: MonitoringService,
  ) {}

  @Post('create')
  async createCheck(
    @Body() checkDto: CreateCheckDto,
    @CurrentUser() user: User,
  ): Promise<Check> {
    return await this.checkService.createCheck(user._id.toString(), checkDto);
  }

  @Get('all')
  async getAllChecks(@CurrentUser() user: User): Promise<Check[]> {
    return await this.checkService.getAllChecks(user._id.toString());
  }

  @Get(':id')
  async getCheck(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.checkService.getCheck(user._id.toString(), id);
  }

  @Delete('remove/:id')
  async removeCheck(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.checkService.removeCheck(user._id.toString(), id);
  }

  @Put('update')
  async updateCheck(
    @Body() payload: UpdateCheckDto,
    @CurrentUser() user: User,
  ) {
    return await this.checkService.updateCheck(user._id.toString(), payload);
  }

  @Get('tags/:tags')
  async findByTags(@CurrentUser() user: User, @Param('tags') tags: string) {
    const tagsArray = tags.split(',');
    return await this.checkService.findByTags(user._id.toString(), tagsArray);
  }

  @Get('result/:id')
  async getCheckResult(@CurrentUser() user: User, @Param('id') id: string) {
    const check = await this.checkService.getCheck(user._id.toString(), id);
    return await this.monitoringService.performCheck(check);
  }

  @Post(':id/start')
  async startMonitoring(@CurrentUser() user: User, @Param('id') id: string) {
    const check = await this.checkService.getCheck(user._id.toString(), id);
    return this.monitoringService.initiateMonitoring(check);
  }

  // @Post(':id/pause')
  // async pauseMonitoring(
  //   @UserId() userId: string,
  //   @Param('id') id: string,
  // ) {
  //   await this.checksService.findOne(userId, id);
  //   return this.monitoringService.pauseMonitoring(id);
  // }

  // @Get(':id/stats')
  // async getStats(
  //   @UserId() userId: string,
  //   @Param('id') id: string,
  //   @Query('period') period: number,
  // ) {
  //   await this.checksService.findOne(userId, id);
  //   return this.monitoringService.getCheckStats(id, period);
  // }
}

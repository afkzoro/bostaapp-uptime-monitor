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
  TagsQueryDto,
  UpdateCheckDto,
  User,
} from '@app/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('check')
@UseGuards(JwtAuthGuard)
export class CheckController {
  constructor(private checkService: CheckService) {}

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
  async findByTags(@CurrentUser() user: User, @Param() { tags }: TagsQueryDto) {
    return await this.checkService.findByTags(user._id.toString(), tags);
  }
}

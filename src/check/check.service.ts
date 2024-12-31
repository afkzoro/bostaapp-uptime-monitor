import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CheckRepository } from './check.repository';
import {
  Check,
  CreateCheckDto,
  CustomHttpException,
  UrlCheckStatus,
} from '@app/common';

@Injectable()
export class CheckService {
  private readonly logger = new Logger();

  constructor(private readonly checkRepository: CheckRepository) {}

  async createCheck(
    user: string,
    createCheckDto: CreateCheckDto,
  ): Promise<Check> {
    const createCheckPayload: Partial<Check> = {
      user,
      ...createCheckDto,
      status: UrlCheckStatus.ACTIVE,
    };
    return await this.checkRepository.create(createCheckPayload);
  }

  async getAllChecks(user: string): Promise<Check[]> {
    return await this.checkRepository.find({
      user,
      isDeleted: false,
    });
  }

  async getCheck(user: string, checkId: string): Promise<Check> {
    const check = await this.checkRepository.findOne({
      _id: checkId,
      user,
      isDeleted: false,
    });

    if (check === null) {
      throw new CustomHttpException(
        'Check cannot be found',
        HttpStatus.NOT_FOUND,
      );
    }

    return check;
  }

  async removeCheck(user: string, checkId: string): Promise<string> {
    try {
      await this.checkRepository.findOneAndUpdate(
        { _id: checkId, user },
        { isDeleted: true },
      );
      return 'Check deleted!';
    } catch (error) {
      throw new CustomHttpException(
        'Check with the provided id cannot be found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async findByTags(user: string, tags: string[]): Promise<Check[]> {
    const checkTag = await this.checkRepository.find({
      user,
      tags: { $in: tags },
    });

    if (checkTag === null) {
      throw new CustomHttpException('Tags do not exist', HttpStatus.NOT_FOUND);
    }

    return checkTag;
  }
}

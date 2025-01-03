import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository, CheckResult } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CheckResultRepository extends AbstractRepository<CheckResult> {
  protected readonly logger = new Logger(CheckResultRepository.name);

  constructor(
    @InjectModel(CheckResult.name) CheckResultModel: Model<CheckResult>,
  ) {
    super(CheckResultModel);
  }
}

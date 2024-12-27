import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository, Check, User } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CheckRepository extends AbstractRepository<Check> {
  protected readonly logger = new Logger(CheckRepository.name);

  constructor(@InjectModel(Check.name) CheckModel: Model<Check>) {
    super(CheckModel);
  }
}

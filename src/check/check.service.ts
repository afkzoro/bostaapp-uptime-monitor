import { Injectable, Logger } from '@nestjs/common';
import { CheckRepository } from './check.repository';
import { Check, CreateCheckDto, UrlCheckStatus } from '@app/common';

@Injectable()
export class CheckService {
    private readonly logger = new Logger()

    constructor(
        private readonly checkRepository: CheckRepository
    ) {}

    async createCheck(user: string, createCheckDto: CreateCheckDto ): Promise<Check> {
        const createCheckPayload: Partial<Check> = {
            user,
            ...createCheckDto,
            status: UrlCheckStatus.ACTIVE
        }
        return await this.checkRepository.create(createCheckPayload)
    }
}

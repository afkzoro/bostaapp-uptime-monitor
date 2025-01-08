import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { MonitoringService } from "./monitoring.service";
import { Check } from "@app/common";


@Processor('monitoring')
export class MonitoringProcessor {
    private readonly logger = new Logger(MonitoringProcessor.name)

    constructor (
        private readonly monitoringService: MonitoringService
    ) {}

    @Process('perform-check')
    async handleCheck(job: Job<{ check: Check}>) {
        this.logger.debug(`Processing check ${job.data.check.name}`);

        try {
            const previousStatus = job.data.check.status;
            const result = await this.monitoringService.performCheck(job.data.check)

            if (previousStatus !== result.)
        } catch (error) {
            
        }
    }
}
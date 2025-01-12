import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Check, CheckSchema, DatabaseModule, EmailService } from '@app/common';
import { CheckController } from './check.controller';
import { CheckService } from './check.service';
import { CheckRepository } from './check.repository';
import { MonitoringModule } from 'src/monitoring/monitoring.module';
import { BullModule } from '@nestjs/bull';
import { MonitoringService } from 'src/monitoring/monitoring.service';
import { MonitoringProcessor } from 'src/monitoring/monitoring.processor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './src/.env',
    }),
    MongooseModule.forFeature([
      {
        name: Check.name,
        schema: CheckSchema,
      },
    ]),
    BullModule.registerQueue({
      name: 'monitoring',
    }),
    MonitoringModule,
    DatabaseModule,
  ],
  controllers: [CheckController],
  providers: [
    CheckService,
    CheckRepository,
    EmailService,
    MonitoringService,
    MonitoringProcessor,
  ],
  exports: [CheckService, CheckRepository],
})
export class CheckModule {}

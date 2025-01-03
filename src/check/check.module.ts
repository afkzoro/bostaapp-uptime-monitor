import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Check, CheckSchema, DatabaseModule, EmailService } from '@app/common';
import { CheckController } from './check.controller';
import { CheckService } from './check.service';
import { CheckRepository } from './check.repository';
import { MonitoringModule } from 'src/monitoring/monitoring.module';

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
    MonitoringModule,
    DatabaseModule,
  ],
  controllers: [CheckController],
  providers: [CheckService, CheckRepository, EmailService],
  exports: [CheckService, CheckRepository],
})
export class CheckModule {}

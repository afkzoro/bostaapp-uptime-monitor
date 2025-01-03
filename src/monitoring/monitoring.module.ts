import { CheckResult, CheckResultSchema, DatabaseModule } from '@app/common';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MonitoringService } from './monitoring.service';
import { CheckResultRepository } from './check-result.repository';
import { CheckModule } from 'src/check/check.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './src/.env',
    }),
    MongooseModule.forFeature([
      {
        name: CheckResult.name,
        schema: CheckResultSchema,
      },
    ]),
    DatabaseModule,
    forwardRef(() => CheckModule),
  ],
  providers: [MonitoringService, CheckResultRepository],
  exports: [MonitoringService, CheckResultRepository],
})
export class MonitoringModule {}

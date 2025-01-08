import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CheckModule } from './check/check.module';
import { ReportModule } from './report/report.module';
import { NotificationModule } from './notification/notification.module';
import { UsersModule } from './users/users.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { QueueModule } from '@app/common';

@Module({
  imports: [
    AuthModule,
    CheckModule,
    ReportModule,
    NotificationModule,
    UsersModule,
    MonitoringModule,
    QueueModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

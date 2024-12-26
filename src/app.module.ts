import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CheckModule } from './check/check.module';
import { MonitorModule } from './monitor/monitor.module';
import { ReportModule } from './report/report.module';
import { NotificationModule } from './notification/notification.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AuthModule,
    CheckModule,
    MonitorModule,
    ReportModule,
    NotificationModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

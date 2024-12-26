import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CheckModule } from './check/check.module';
import { MonitorModule } from './monitor/monitor.module';
import { ReportModule } from './report/report.module';
import { NotificationModule } from './notification/notification.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, CheckModule, MonitorModule, ReportModule, NotificationModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

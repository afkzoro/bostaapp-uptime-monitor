import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService): BullModuleOptions => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
        defaultJobOptions: {
          removeOnComplete: true,
          attempts: 3,
        },
      }),
      inject: [ConfigService],
    } as any),
  ],
  exports: [BullModule],
})
export class QueueModule {}

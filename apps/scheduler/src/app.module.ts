import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { InternalApiModule } from '@libs/common/index';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InternalApiModule,
    SchedulerModule,
  ],
})
export class SchedulerAppModule {}

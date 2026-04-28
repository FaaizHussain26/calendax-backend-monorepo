import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '@libs/config/configuration';
import { InternalApiModule } from '@libs/common/index';
import { SchedulerModule } from './modules/scheduler/scheduler.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [configuration] }), InternalApiModule, SchedulerModule],
})
export class SchedulerAppModule {}

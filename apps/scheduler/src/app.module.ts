import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { InternalApiModule } from '@libs/common/index';
import configuration from '@libs/config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true,
            load: [configuration],

     }),
    InternalApiModule,
    SchedulerModule,
  ],
})
export class SchedulerAppModule {}

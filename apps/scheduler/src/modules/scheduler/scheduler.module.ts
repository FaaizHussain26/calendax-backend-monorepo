import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { AwsModule } from '@libs/aws/aws.module';
import { InternalApiModule } from '@libs/common/index';
import { SchedulerController } from './schedular.controller';

@Module({
  imports: [AwsModule,InternalApiModule],
  controllers:[SchedulerController],
  providers: [SchedulerService],
})
export class SchedulerModule {}

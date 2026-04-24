import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { AwsModule } from '@libs/aws/aws.module';

@Module({
  imports: [AwsModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}

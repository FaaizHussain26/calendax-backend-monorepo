import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AwsSchedulerService } from './aws-scheduler.service';
import { AwsSqsService } from './aws-sqs.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [AwsSchedulerService, AwsSqsService],
  exports: [AwsSchedulerService, AwsSqsService],
})
export class AwsModule {}

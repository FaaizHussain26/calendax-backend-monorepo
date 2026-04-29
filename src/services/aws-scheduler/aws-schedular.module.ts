import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AwsSchedulerService } from './aws-schedular.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [AwsSchedulerService],
  exports: [AwsSchedulerService],
})
export class AwsSchedulerModule {}
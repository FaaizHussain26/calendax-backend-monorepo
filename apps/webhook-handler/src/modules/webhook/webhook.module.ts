import { Module } from '@nestjs/common';
import { AwsModule } from '@libs/aws/aws.module';
import { TwilioModule } from '@libs/twilio/twilio.module';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@Module({
  imports: [AwsModule, TwilioModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}

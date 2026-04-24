import { Module } from '@nestjs/common';
import { AwsModule } from '@libs/aws/aws.module';
import { ElevenLabsModule } from '@libs/elevenlabs/elevenlabs.module';
import { TwilioModule } from '@libs/twilio/twilio.module';
import { CallProcessorService } from './call-processor.service';

@Module({
  imports: [AwsModule, ElevenLabsModule, TwilioModule],
  providers: [CallProcessorService],
})
export class CallProcessorModule {}

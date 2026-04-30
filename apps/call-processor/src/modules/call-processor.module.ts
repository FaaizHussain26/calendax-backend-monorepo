import { Module } from '@nestjs/common';
import { TwilioModule } from '@libs/twilio/twilio.module';
import { InternalApiModule } from '@libs/common/index';
import { CallProcessorService } from './call-processor.service';

@Module({
  imports: [TwilioModule, InternalApiModule],
  providers: [CallProcessorService],
})
export class CallProcessorModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TwilioModule } from '@libs/twilio/twilio.module';
import configuration from '@libs/config/configuration';
import { InternalApiModule } from '@libs/common/index';
import { CallProcessorModule } from './call-processor.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TwilioModule,
    InternalApiModule,
    CallProcessorModule,
  ],
})
export class CallProcessorAppModule {}

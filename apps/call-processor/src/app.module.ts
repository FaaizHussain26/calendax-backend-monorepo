import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CallProcessorModule } from './modules/call-processor/call-processor.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CallProcessorModule,
  ],
})
export class CallProcessorAppModule {}

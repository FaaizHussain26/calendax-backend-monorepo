import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ElevenLabsService } from './elevenlabs.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [ElevenLabsService],
  exports: [ElevenLabsService],
})
export class ElevenLabsModule {}
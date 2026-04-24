import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InternalApiClient } from './internal-api.client';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [InternalApiClient],
  exports: [InternalApiClient],
})
export class InternalApiModule {}
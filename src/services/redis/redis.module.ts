import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisHelper } from './redis.helper';

@Global()
@Module({
  providers: [RedisService, RedisHelper],
  exports: [RedisService, RedisHelper],
})
export class RedisModule {}

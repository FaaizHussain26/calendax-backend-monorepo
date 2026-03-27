import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
 
import { JwtHelper } from './jwt.provider';
import { RedisModule } from '../redis/redis.module';
 
 
@Global()
@Module({
  imports: [
    RedisModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),
  ],
  providers: [
    JwtHelper,
  ],
  exports: [
    JwtHelper,
    JwtModule,
  ],
})
export class JwtCommonModule {}
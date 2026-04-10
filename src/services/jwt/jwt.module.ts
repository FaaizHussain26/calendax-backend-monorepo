import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { JwtAuthGuard, JwtHelper, JwtStrategy } from './jwt.provider';
import { RedisModule } from '../redis/redis.module';
import { PassportModule } from '@nestjs/passport';
import { TokenBlacklistService } from './token-blacklist';

@Global()
@Module({
  imports: [
    RedisModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
  providers: [JwtHelper, JwtStrategy, JwtAuthGuard, TokenBlacklistService],
  exports: [JwtHelper, JwtModule, JwtStrategy, JwtAuthGuard, PassportModule],
})
export class JwtCommonModule {}

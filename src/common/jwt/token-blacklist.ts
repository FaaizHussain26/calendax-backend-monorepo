import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class TokenBlacklistService {
  private readonly PREFIX = 'jwt:blacklist:';

  constructor(private readonly redisService: RedisService) {}

  async blacklist(jti: string, expiresAt: number) {
    const ttl = expiresAt - Math.floor(Date.now() / 1000);

    if (ttl <= 0) return;

    const key = `${this.PREFIX}${jti}`;

    await this.redisService.getClient().set(
      key,
      '1',
      'EX',
      ttl,
    );
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    const key = `${this.PREFIX}${jti}`;
    const exists = await this.redisService.getClient().exists(key);
    return exists === 1;
  }
}

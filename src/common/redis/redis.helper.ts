// common/redis/redis.helper.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RedisHelper {
  private readonly client;

  constructor(private readonly redisService: RedisService) {
    this.client = this.redisService.getClient();
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(key, serialized, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, serialized);
    }
  }


  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }


  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length) await this.client.del(...keys);
  }


  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }


  async ttl(key: string): Promise<number> {
    return this.client.ttl(key); // returns -1 if no expiry, -2 if not found
  }

  async updateTtl(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }


  async getKeysByPattern(pattern: string): Promise<string[]> {
    return this.client.keys(pattern); // e.g. 'session:*'
  }

  async deleteByPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length) await this.client.del(...keys);
  }


  async hset(key: string, field: string, value: unknown): Promise<void> {
    await this.client.hset(key, field, JSON.stringify(value));
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    const data = await this.client.hget(key, field);
    if (!data) return null;
    return JSON.parse(data) as T;
  }

  async hgetAll<T>(key: string): Promise<Record<string, T>> {
    const data = await this.client.hgetall(key);
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, JSON.parse(v as string)]),
    ) as Record<string, T>;
  }

  async hdel(key: string, field: string): Promise<void> {
    await this.client.hdel(key, field);
  }
}
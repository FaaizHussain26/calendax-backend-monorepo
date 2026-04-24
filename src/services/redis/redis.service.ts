import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis({
      host: this.config.get<string>('redis.host', '127.0.0.1'),
      port: this.config.get<number>('redis.port', 6379),
      password: this.config.get<string>('redis.password'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 100, 2000);
        this.logger.warn(`Redis reconnect attempt #${times}, delay ${delay}ms`);
        return delay;
      },
    });

    this.registerEvents();
  }

  private registerEvents() {
    this.client.on('connect', () => {
      this.logger.log('Redis connecting...');
    });

    this.client.on('ready', () => {
      this.logger.log('Redis connected and ready');
    });

    this.client.on('reconnecting', () => {
      this.logger.warn('Redis reconnecting...');
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis error', error.stack);
    });

    this.client.on('close', () => {
      this.logger.warn('Redis connection closed');
    });

    this.client.on('end', () => {
      this.logger.warn('Redis connection ended');
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async onModuleDestroy() {
    this.logger.warn('Closing Redis connection...');
    await this.client.quit();
  }
}

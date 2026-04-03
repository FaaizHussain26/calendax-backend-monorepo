import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient } from 'mongodb';

@Injectable()
export class MongoAdminService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MongoAdminService.name);
  private client: MongoClient;

  constructor(private config: ConfigService) {
    // Attempt to get the full URI first
    const uri = this.config.get<string>('db.mongodb.uri');

      this.client = new MongoClient(uri!);
    
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('Successfully connected to MongoDB Admin');
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB Admin', error.stack);
    }
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  get clientInstance(): MongoClient {
    return this.client; 
  }

  get adminDb() {
    // Useful for createUser, dropUser, etc.
    return this.client.db('admin');
  }
}
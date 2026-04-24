import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUES, registerQueue } from './queue.config';
import { TenantModule } from '../../modules/tenant/tenant.module';
import { DocumentQueueService } from './services/document-queue.service';
import { DocumentProcessor } from './processors/document.processor';
import { DocumentProcessorService } from '../doc/document-processor.service';

@Global() 
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host', 'localhost'),
          port: config.get<number>('redis.port', 6379),
          password: config.get<string>('redis.password'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 100,
          removeOnFail: 200,
        },
      }),
    }),
     registerQueue(QUEUES.DOCUMENT),
     TenantModule
  ],
  providers: [
    DocumentQueueService,  
    DocumentProcessor,    
    DocumentProcessorService,
  ],
  exports: [
    BullModule,
    DocumentQueueService, 
  ],
})
export class QueueModule {}
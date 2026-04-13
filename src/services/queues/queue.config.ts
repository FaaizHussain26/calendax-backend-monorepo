import { BullModule } from '@nestjs/bullmq';

export const QUEUES = {
  DOCUMENT: 'document-processing',
  EMAIL: 'email',          
  REPORT: 'report',        
  NOTIFICATION: 'notification',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

// 👇 reusable — register any queue by name
export function registerQueue(name: QueueName) {
  return BullModule.registerQueue({
    name,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 200,
    },
  });
}
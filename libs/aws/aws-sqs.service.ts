import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  GetQueueUrlCommand,
} from '@aws-sdk/client-sqs';

export interface CallJob {
  tenantId: string;
  leadId: string;
  callingConfigId: string;
  agentId: string;
  attemptNumber: number;
}

@Injectable()
export class AwsSqsService {
  private readonly client: SQSClient;
  private readonly logger = new Logger(AwsSqsService.name);
  private readonly queuePrefix: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new SQSClient({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.queuePrefix = this.configService.get<string>('SQS_QUEUE_PREFIX') ?? 'calling';
  }

  private queueName(tenantId: string): string {
    return `${this.queuePrefix}-${tenantId}.fifo`;
  }

  async getQueueUrl(tenantId: string): Promise<string> {
    const res = await this.client.send(
      new GetQueueUrlCommand({ QueueName: this.queueName(tenantId) }),
    );
    return res.QueueUrl;
  }

  /**
   * Enqueues a call job for a tenant.
   * delaySeconds: SQS message delay (0–900s).
   * Used for immediate dispatch (0) and retries (callDelay * 60).
   */
  async enqueue(job: CallJob, delaySeconds: number = 0): Promise<void> {
    const queueUrl = await this.getQueueUrl(job.tenantId);
    try {
      await this.client.send(
        new SendMessageCommand({
          QueueUrl: queueUrl,
          MessageBody: JSON.stringify(job),
          MessageGroupId: job.tenantId,
          MessageDeduplicationId: `${job.leadId}-${job.attemptNumber}-${Date.now()}`,
          DelaySeconds: Math.min(delaySeconds, 900),
        }),
      );
      this.logger.log(`Enqueued call job for lead ${job.leadId} · attempt ${job.attemptNumber}`);
    } catch (error) {
      this.logger.error(`Failed to enqueue job for lead ${job.leadId}`, error);
      throw error;
    }
  }
}

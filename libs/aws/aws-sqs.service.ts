import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  GetQueueUrlCommand,
  CreateQueueCommand,
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
        region: this.configService.get<string>('aws.region'),
        credentials: {
          accessKeyId: this.configService.get<string>('aws.sqs.accessKeyId'),
          secretAccessKey: this.configService.get<string>('aws.sqs.secretAccessKey'),
        },
      });
      this.queuePrefix = this.configService.get<string>('aws.sqs.queuePrefix') ?? 'calling';
    }
async createTenantQueue(tenantId: string): Promise<string> {
  const queueName = `${this.queuePrefix}-${tenantId}.fifo`;
  try {
    const result = await this.client.send(
      new CreateQueueCommand({
        QueueName: queueName,
        Attributes: {
          FifoQueue: 'true',
          ContentBasedDeduplication: 'true',
          VisibilityTimeout: '300',
          ReceiveMessageWaitTimeSeconds: '20',
        },
      }),
    );
    this.logger.log(`Created SQS queue: ${queueName}`);
    return result.QueueUrl;
  } catch (error) {
    this.logger.error(`Failed to create SQS queue ${queueName}`, error);
    throw error;
  }
}
  /**
   * Builds the per-tenant FIFO queue URL.
   * Queue must be pre-created in AWS Console or via SDK.
   * Naming convention: calling-{tenantId}.fifo
   */
private buildQueueUrl(tenantId: string): string {
  const region = this.configService.get<string>('aws.region');
  const accountId = this.configService.get<string>('aws.accountId');
  const url = `https://sqs.${region}.amazonaws.com/${accountId}/${this.queuePrefix}-${tenantId}.fifo`;
  this.logger.log(`Built queue URL: ${url}`);
  return url;
}
  /**
   * Enqueues a call job onto the tenant's FIFO queue.
   * delaySeconds: 0 for immediate, callDelay * 60 for retries.
   * Note: SQS FIFO queues support max 900 seconds delay.
   */
  async enqueue(job: CallJob, delaySeconds: number = 0): Promise<void> {
    const queueUrl = this.buildQueueUrl(job.tenantId);
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
      this.logger.log(
        `Enqueued call job — lead: ${job.leadId} · attempt: ${job.attemptNumber}`,
      );
    } catch (error) {
      this.logger.error(`Failed to enqueue job for lead ${job.leadId}`, error);
      throw error;
    }
  }

  /**
   * Receives messages from any queue by URL.
   * Used by call processor to poll per-tenant queues.
   */
  async receiveMessages(queueUrl: string, maxMessages = 10) {
    const result = await this.client.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: maxMessages,
        WaitTimeSeconds: 20,
      }),
    );
    return result.Messages ?? [];
  }

  /**
   * Deletes a message after successful processing.
   */
  async deleteMessage(queueUrl: string, receiptHandle: string): Promise<void> {
    await this.client.send(
      new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      }),
    );
  }
}
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { AwsSqsService, CallJob } from '@libs/aws/aws-sqs.service';
import { DayOfWeek, InternalApiClient } from '@libs/common/index';
import { validate } from 'uuid';

export interface SchedulerEvent {
  tenantId: string;
  callingConfigId: string;
}

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);
  private readonly triggerClient: SQSClient;
  private readonly triggerQueueUrl: string;

  constructor(
    private readonly internalApi: InternalApiClient,
    private readonly sqsService: AwsSqsService,
    private readonly config: ConfigService,
  ) {
    const keyId = this.config.get<string>('aws.sqs.accessKeyId');
    const secret = this.config.get<string>('aws.sqs.secretAccessKey');
    this.logger.log(
      `SQS credentials loaded — keyId: ${keyId ? 'SET' : 'MISSING'} · secret: ${secret ? 'SET' : 'MISSING'}`,
    );
    this.triggerClient = new SQSClient({
      region: this.config.get<string>('aws.region'),
      credentials: {
        accessKeyId: keyId,
        secretAccessKey: secret,
      },
    });
    this.triggerQueueUrl = this.config.get<string>('aws.schedular.triggerQueueUrl');
  }

  onModuleInit() {
    this.logger.log('Scheduler service started — polling trigger queue');
    this.poll();
  }

  /**
   * Long polls Queue 1 (calendax-scheduler-triggers.fifo).
   * EventBridge drops { tenantId, callingConfigId } here.
   * Runs forever — restarts after errors with 5s backoff.
   */
 private async poll(): Promise<void> {
  while (true) {
    try {
      const result = await this.triggerClient.send(
        new ReceiveMessageCommand({
          QueueUrl: this.triggerQueueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 20,
        }),
      );

      for (const message of result.Messages ?? []) {
        try {
          const event: SchedulerEvent = JSON.parse(message.Body);
          await this.handleSchedulerEvent(event);

          // only delete after successful processing
          await this.triggerClient.send(
            new DeleteMessageCommand({
              QueueUrl: this.triggerQueueUrl,
              ReceiptHandle: message.ReceiptHandle,
            }),
          );
        } catch (err) {
          if (err instanceof SyntaxError) {
            this.logger.warn(`Invalid JSON — deleting poison pill message ${message.MessageId}`);
            await this.triggerClient.send(
              new DeleteMessageCommand({
                QueueUrl: this.triggerQueueUrl,
                ReceiptHandle: message.ReceiptHandle,
              }),
            );
          } else {
            this.logger.error(`Failed to process message ${message.MessageId}`, err);
            // don't delete — visibility timeout expires → retries automatically
          }
        }
      }
    } catch (err) {
      this.logger.error('Polling error — retrying in 5s', err);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

  async handleSchedulerEvent(event: SchedulerEvent): Promise<void> {
    const isProd = process.env.NODE_ENV === 'production';
    const { tenantId, callingConfigId } = event;
    this.logger.log(`Scheduler fired — tenantId: ${tenantId} · configId: ${callingConfigId}`);
    if (!callingConfigId || !tenantId) {
      this.logger.warn(`Required props missing — skipping`);
      return;
    }
    if (!validate(tenantId)) {
      this.logger.warn(`Invalid tenantId format — skipping`);
      return;
    }
    // ── Step 1: Load CallingConfig from main API ──────────────────────
    const { data: callingConfig }: any = await this.internalApi.getCallingConfig(callingConfigId, tenantId);
    console.log('calling config is:',isProd, callingConfig);
    if (!callingConfig) {
      this.logger.warn(`CallingConfig ${callingConfigId} not found — skipping`);
      return;
    }

    // ── Step 2: Check selectedDays ────────────────────────────────────
    if (!this.isTodaySelected(callingConfig.selectedDays)) {
      this.logger.log(`Today is not a calling day — skipping`);
      if (isProd) return;
    }

    // ── Step 3: Check callTimeWindow ──────────────────────────────────
    if (!this.isWithinWindow(callingConfig.callTimeWindow)) {
      this.logger.log(`Outside call window — skipping`);
      if (isProd) return;
    }

    // ── Step 4: Fetch pending leads from main API ─────────────────────
    const {data:leads}: any = await this.internalApi.getPendingLeads(callingConfigId, callingConfig.numOfCalls, tenantId);

    if (!leads.length) {
      this.logger.log(`No pending leads — skipping`);
      return;
    }

    this.logger.log(`Enqueuing ${leads.length} leads`);

    // ── Step 5: Enqueue each lead onto per-tenant SQS queue ───────────
    for (const lead of leads) {
      /// add lead checks here
      // also add allow repeatative lead check
      const job: CallJob = {
        tenantId,
        leadId: lead.id,
        callingConfigId,
        agentId: '', // loaded by call processor from AgentConfig
        attemptNumber: lead.callAttempts + 1,
      };

      await this.sqsService.enqueue(job, 0);
      this.logger.log(`Enqueued lead ${lead.id} · attempt ${job.attemptNumber}`);
    }

    this.logger.log(`Scheduler complete — ${leads.length} jobs enqueued`);
  }

  private isTodaySelected(selectedDays: string[]): boolean {
    const days = Object.values(DayOfWeek);
    const today = days[new Date().getUTCDay()];
    console.log('today is:', today);
    return selectedDays?.map((d) => d.toLowerCase()).includes(today?.toLowerCase());
  }

  private isWithinWindow(callTimeWindow: { startTime: string; endTime: string }): boolean {
    console.log('calling time window', callTimeWindow);
    const now = new Date();
    const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const [startH, startM] = callTimeWindow?.startTime?.split(':')?.map(Number);
    const [endH, endM] = callTimeWindow?.endTime?.split(':')?.map(Number);
    return currentMinutes >= startH * 60 + startM && currentMinutes <= endH * 60 + endM;
  }
}

import { Injectable, Logger } from '@nestjs/common';

export interface SchedulerEvent {
  tenantId: string;
  callingConfigId: string;
}

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  /**
   * Entry point called by EventBridge.
   * Will be implemented once CallingConfig and Lead modules
   * are accessible via @libs/database.
   *
   * Flow:
   * 1. Load CallingConfig by callingConfigId + tenantId
   * 2. Check selectedDays — is today a call day?
   * 3. Check callTimeWindow — are we inside the window?
   * 4. Query pending leads WHERE callingConfigId = x LIMIT numOfCalls
   * 5. Enqueue each lead as a CallJob onto tenant's SQS queue
   */
  async handleSchedulerEvent(event: SchedulerEvent): Promise<void> {
    this.logger.log(
      `Scheduler fired — tenantId: ${event.tenantId} · configId: ${event.callingConfigId}`,
    );
  }
}

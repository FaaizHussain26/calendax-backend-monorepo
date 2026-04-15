import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES } from '../queue.config';
import { CreateTenantDto } from '../../../modules/tenant/tenant.dto';
import { TenantJobData } from '../../../common/interfaces/tenant.inteface';

@Injectable()
export class TenantQueueService {
  constructor(
    @InjectQueue(QUEUES.TENANT)
    private readonly queue: Queue<TenantJobData>,
  ) {}

  async addTenantJob(payload: TenantJobData): Promise<string> {
    const job = await this.queue.add('tenet-processing', payload);
    return job.id!;
  }

  async getJobStatus(jobId: string) {
    const job = await this.queue.getJob(jobId);
    if (!job) return null;
    return {
      id: job.id,
      status: await job.getState(),
      progress: job.progress,
      failedReason: job.failedReason,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }
}

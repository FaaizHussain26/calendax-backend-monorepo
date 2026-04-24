import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES } from '../queue.config';
import { DocumentJobPayload } from '@libs/common/interfaces/document.interface';

@Injectable()
export class DocumentQueueService {
  constructor(
    @InjectQueue(QUEUES.DOCUMENT)
    private readonly queue: Queue<DocumentJobPayload>,
  ) {}

  async addDocumentJob(payload: DocumentJobPayload): Promise<string> {
    const job = await this.queue.add('process-document', payload);
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
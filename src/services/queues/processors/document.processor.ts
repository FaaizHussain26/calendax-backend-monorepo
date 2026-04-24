import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { QUEUES } from '../queue.config';
import { DocumentProcessorService } from '../../doc/document-processor.service';
import { TenantConnectionManager } from '../../../database/tenant/tenant-connection.manager';
import { TenantRepository } from '../../../modules/tenant/tenant.repository';
import { ProtocolDocumentStatus } from '@libs/common/enums/protocol.enum';
import { ProtocolDocumentRepository } from '../../../modules/tenant-modules/protocol/document/document-embedding.repository';
import { DocumentJobPayload } from '@libs/common/interfaces/document.interface';
import { ProtocolRepository } from '../../../modules/tenant-modules/protocol/protocol.repository';
import { ProtocolEntity } from '../../../modules/tenant-modules/protocol/protocol.entity';
import { ProtocolDocumentMetaRepository } from '../../../modules/tenant-modules/protocol/document/document-meta.repository';
import { ProtocolDocumentMetaEntity } from '../../../modules/tenant-modules/protocol/document/document-meta.entity';
import { DataSource } from 'typeorm';
import { Db } from 'mongodb';

@Processor(QUEUES.DOCUMENT, {
  concurrency: 2,
})
export class DocumentProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentProcessor.name);

  constructor(
    private readonly documentProcessorService: DocumentProcessorService,
    private readonly tenantRepository: TenantRepository,
    private readonly connectionManager: TenantConnectionManager,
  ) {
    super();
  }
  private buildRepos(connection: { sql: DataSource; mongo: Db }) {
    return {
      protocolRepo: new ProtocolRepository(connection.sql.getRepository(ProtocolEntity)),
      protocolDocumentMetaRepo: new ProtocolDocumentMetaRepository(
        connection.sql.getRepository(ProtocolDocumentMetaEntity),
      ),
      protocolDocumentRepo: new ProtocolDocumentRepository(connection.mongo),
    };
  }

  async process(job: Job<DocumentJobPayload>): Promise<void> {
    const { protocolId, filePath, siteIds, indicationId, tenantId, originalName, fileName, mimeType, fileSize } =
      job.data;

    this.logger.log(`Processing document for protocol: ${protocolId} fot tenant:${tenantId} attempt: ${job.attemptsMade + 1}`);

    // 1. get tenant connection
    const tenant = await this.tenantRepository.getByTenantId(tenantId);
    if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);

    const connection = await this.connectionManager.getConnection(tenant);
    const { protocolRepo, protocolDocumentMetaRepo, protocolDocumentRepo } = this.buildRepos(connection);

    await job.updateProgress(10);
    await protocolRepo.update(protocolId, {
      documentStatus: ProtocolDocumentStatus.PROCESSING,
    });
    // 2. process document
    const file = {
      path: filePath,
      originalname: originalName,
      filename: fileName,
      mimetype: mimeType,
      size: fileSize,
    } as Express.Multer.File;

    const { chunks, totalPages, totalChunks } = await this.documentProcessorService.processDocument(file, {
      protocolId,
      protocolNumber: protocolId,
      siteIds,
      indicationId,
    });

    await job.updateProgress(60);

    // 3. store chunks in MongoDB
    console.log('inserting chunks',job.id);

    await protocolDocumentRepo.insertChunks(chunks);

    await job.updateProgress(75);
    console.log('meta inserting',job.id);

    // 4. update protocol status
    const currentMeta = await protocolDocumentMetaRepo.findCurrentByProtocolId(protocolId);
    const nextVersion = (currentMeta?.version ?? 0) + 1;

    const newMeta = await protocolDocumentMetaRepo.create({
      protocolId,
      originalName,
      fileName,
      filePath,
      mimeType,
      fileSize,
      totalPages,
      totalChunks,
      isProcessed: true,
      version: nextVersion,
      isCurrent: true,
    });

    if (currentMeta) {
      await protocolDocumentMetaRepo.markAsReplaced(currentMeta.id, newMeta.id);
      await protocolDocumentRepo.deleteByProtocolIdAndFileId(protocolId,currentMeta.id); // remove old chunks
    }

    await job.updateProgress(90);

    // 6. mark protocol as completed
    await protocolRepo.update(protocolId, {
      documentStatus: ProtocolDocumentStatus.COMPLETED,
      isUploaded: true,
      documentId: newMeta.id,
    });

    await job.updateProgress(100);
    this.logger.log(`Document v${nextVersion} processed for protocol: ${protocolId}`);
    this.logger.log(`Document processing completed for protocol: ${protocolId}`);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<DocumentJobPayload>, error: Error): Promise<void> {
    this.logger.error(`Job ${job.id} failed for protocol ${job.data.protocolId}: ${error.message}`);

    // only update status after all retries exhausted
    if (job.attemptsMade >= (job.opts.attempts ?? 3)) {
      try {
        const tenant = await this.tenantRepository.getByTenantId(job.data.tenantId);
        if (!tenant) return;

        const connection = await this.connectionManager.getConnection(tenant);
        const { protocolRepo } = this.buildRepos(connection);

        await protocolRepo.update(job.data.protocolId, {
          documentStatus: ProtocolDocumentStatus.FAILED,
        });
      } catch (err) {
        this.logger.error(`Failed to update protocol status after failure: ${err}`);
      }
    }
  }
  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.log(`Job ${job.id} completed`);
  }
}

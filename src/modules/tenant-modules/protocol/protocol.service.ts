// protocol.service.ts
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, Scope } from '@nestjs/common';
import { ProtocolRepository } from './protocol.repository';
import { SiteService } from '../site/site.service';
import { IndicationService } from '../indication/indication.service';
import { CreateProtocolDto, ListAllProtocolQueryDto, UpdateProtocolDto } from './protocol.dto';
import { ProtocolEntity } from './protocol.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { HelperFunctions } from '../../../common/utils/functions';
import { DocumentProcessorService } from '../../../services/doc/document-processor.service';
import { ProtocolDocumentRepository } from './document/document-embedding.repository';
import { Db } from 'mongodb';
import { DocumentChunk } from '../../../common/interfaces/document.interface';
import { ProtocolDocumentMetaRepository } from './document/document-meta.repository';
import { ProtocolDocumentStatus, ProtocolStatus } from '../../../common/enums/protocol.enum';
import { DocumentQueueService } from '../../../services/queues/services/document-queue.service';

@Injectable()
export class ProtocolService {
  constructor(
    private readonly protocolRepository: ProtocolRepository,
    private readonly siteService: SiteService,
    private readonly indicationService: IndicationService,
    private readonly documentProcessor: DocumentProcessorService,
    private readonly protocolDocumentMetaRepository: ProtocolDocumentMetaRepository,
    private readonly documentQueueService: DocumentQueueService,
  ) {}

  async findAll(query: ListAllProtocolQueryDto) {
    return this.protocolRepository.findAll(query);
  }

  async findById(id: string): Promise<ProtocolEntity> {
    const protocol = await this.protocolRepository.findById(id);
    if (!protocol) throw new NotFoundException('Protocol not found');
    return protocol;
  }

  async findByIds(ids: string[]): Promise<ProtocolEntity[]> {
    const protocols = await this.protocolRepository.findByIds(ids);
    if (protocols.length !== ids.length) {
      throw new NotFoundException('One or more protocols not found');
    }
    return protocols;
  }

  async create(
    dto: CreateProtocolDto,
    file: Express.Multer.File,
    tenantId: string,
  ): Promise<{ protocol: ProtocolEntity | null; message: string; data: {jobId:string,id:string} }> {
    const { siteIds, indicationId, ...protocolData } = dto;
    console.log('file is:', file);
    const existing = await this.protocolRepository.findOneByCondition({
      protocolNumber: protocolData.protocolNumber,
    });
    if (existing) throw new ConflictException('Protocol number already exists');

    if (indicationId) {
      await this.indicationService.findById(indicationId);
    }
    const slug = protocolData?.name ? HelperFunctions.generateSlug(protocolData.name) : undefined;

    const protocol = await this.protocolRepository.create({
      ...protocolData,
      slug,
      indicationId,
      documentStatus: ProtocolDocumentStatus.PENDING,
      isUploaded: false,
    });

    if (siteIds?.length) {
      const sites = await this.siteService.findByIds(siteIds);
      await this.protocolRepository.assignSites(protocol.id, sites);
    }

    const jobId = await this.documentQueueService.addDocumentJob({
      protocolId: protocol.id,
      filePath: file.path,
      originalName: file.originalname,
      fileName: file.filename,
      mimeType: file.mimetype,
      fileSize: file.size,
      siteIds: siteIds ?? [],
      indicationId,
      tenantId,
    });
    return {
      protocol: await this.protocolRepository.findById(protocol.id),
      message: 'Protocol created. Document processing queued.',
      data:{jobId,id:protocol.id},
    };
  }

  async update(
    id: string,
    dto: UpdateProtocolDto,
    file?: Express.Multer.File,
    tenantId?: string,
  ): Promise<{ protocol: ProtocolEntity | null; message: string; jobId?: string }> {
    const protocol = await this.findById(id);
    const { siteIds, indicationId, ...protocolData } = dto;

    if (indicationId) {
      await this.indicationService.findById(indicationId);
    }

    if (Object.keys(protocolData).length || indicationId) {
      await this.protocolRepository.update(id, { ...protocolData, indicationId });
    }

    if (siteIds?.length) {
      const sites = await this.siteService.findByIds(siteIds);
      await this.protocolRepository.assignSites(id, sites);
    }
    let jobId: string | undefined;
    if (file && tenantId) {
      await this.protocolRepository.update(id, {
        documentStatus: ProtocolDocumentStatus.PENDING,
        isUploaded: false,
        status:ProtocolStatus.UPDATED
      });
      jobId = await this.documentQueueService.addDocumentJob({
        protocolId: protocol.id,
        filePath: file.path,
        originalName: file.originalname,
        fileName: file.filename,
        mimeType: file.mimetype,
        fileSize: file.size,
        siteIds: siteIds ?? protocol.sites?.map((s) => s.id) ?? [],
        indicationId,
        tenantId,
      });
   
    }
    return {
      protocol: await this.protocolRepository.findById(id),
      message: file ? 'Protocol updated. Document processing queued.' : 'Protocol updated successfully.',
      jobId,
    };
  }

  async remove(id: string) {
    await this.findById(id);
    await this.protocolRepository.delete(id);
    return { message: 'Protocol Deleted Successfully' };
  }
  async getDocumentHistory(protocolId: string) {
    await this.findById(protocolId);
    return this.protocolDocumentMetaRepository.findAllByProtocolId(protocolId);
  }
}

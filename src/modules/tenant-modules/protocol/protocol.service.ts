// protocol.service.ts
import { ConflictException, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { ProtocolRepository } from './protocol.repository';
import { SiteService } from '../site/site.service';
import { IndicationService } from '../indication/indication.service';
import { CreateProtocolDto, ListAllProtocolQueryDto, UpdateProtocolDto } from './protocol.dto';
import { ProtocolEntity } from './protocol.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { HelperFunctions } from '../../../common/utils/functions';

@Injectable()
export class ProtocolService {
  constructor(
    private readonly protocolRepository: ProtocolRepository,
    private readonly siteService: SiteService,
    private readonly indicationService: IndicationService,
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

  async create(dto: CreateProtocolDto, file: Express.Multer.File): Promise<ProtocolEntity | null> {
    const { siteIds, indicationId, ...protocolData } = dto;
    console.log('payload of create protocol:', dto, file);
    const existing = await this.protocolRepository.findOneByCondition({
      protocolNumber: protocolData.protocolNumber,
    });
    if (existing) throw new ConflictException('Protocol number already exists');

    if (indicationId) {
      await this.indicationService.findById(indicationId);
    }
    const protocol = await this.protocolRepository.create({
      ...protocolData,
      document:file.path,
      indicationId,
    });

    if (siteIds?.length) {
      const sites = await this.siteService.findByIds(siteIds);
      await this.protocolRepository.assignSites(protocol.id, sites);
    }

    return this.protocolRepository.findById(protocol.id);
  }

  async update(id: string, dto: UpdateProtocolDto): Promise<ProtocolEntity | null> {
    await this.findById(id);
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

    return this.protocolRepository.findById(id);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.protocolRepository.delete(id);
    return { message: 'Protocol Deleted Successfully' };
  }
}

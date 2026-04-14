// protocol.repository.ts
import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { ProtocolEntity } from './protocol.entity';
import { SiteEntity } from '../site/site.entity';
import { ProtocolStatus } from '../../../common/enums/protocol.enum';
import { ListAllProtocolQueryDto } from './protocol.dto';

@Injectable({ scope: Scope.REQUEST })
export class ProtocolRepository {
  constructor(
    @Inject(`${ProtocolEntity.name}Repository`)
    private readonly repo: Repository<ProtocolEntity>,
  ) {}

  async findAll(query: ListAllProtocolQueryDto) {
    const { search, page = 1, limit = 10, all = false, status } = query;
    const baseWhere = {
      ...(status && { status }),
    };
    const [data, total] = await this.repo.findAndCount({
      where: search
        ? [
            { ...baseWhere, name: ILike(`%${search}%`) },
            { ...baseWhere, protocolNumber: ILike(`%${search}%`) },
          ]
        : baseWhere,
      relations: { indication: true, sites: true,documents:true },
      order: { createdAt: 'DESC' },
      ...(all ? {} : { skip: (page - 1) * limit, take: limit }),
    });

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<ProtocolEntity | null> {
    console.log('id:', id);

    return this.repo.findOne({
      where: { id },
      relations: { indication: true, sites: true, documents: true },
    });
  }

  async findByIds(ids: string[]): Promise<ProtocolEntity[]> {
    return this.repo.find({ where: { id: In(ids) } });
  }

  async findOneByCondition(condition: FindOptionsWhere<ProtocolEntity>): Promise<ProtocolEntity | null> {
    return this.repo.findOne({ where: condition });
  }

  async create(data: Partial<ProtocolEntity>): Promise<ProtocolEntity> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<ProtocolEntity>): Promise<ProtocolEntity | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async assignSites(protocolId: string, sites: SiteEntity[]): Promise<void> {
    const protocol = await this.repo.findOne({
      where: { id: protocolId },
      relations: { sites: true },
    });
    if (!protocol) throw new NotFoundException('Protocol not found');
    protocol.sites = sites;
    await this.repo.save(protocol);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}

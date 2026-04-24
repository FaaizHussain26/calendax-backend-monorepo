import { Inject, Injectable, Scope } from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { LeadEntity } from './lead.entity';
import { LeadQueryDto } from './lead.dto';
import { LeadStatus } from '@libs/common/enums/lead.enum';

@Injectable({ scope: Scope.REQUEST })
export class LeadRepository {
  constructor(
    @Inject(`${LeadEntity.name}Repository`)
    private readonly repo: Repository<LeadEntity>,
  ) {}

  private get baseSelect() {
    return {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      dob: true,
      bestTimeToCall: true,
      source: true,
      status: true,
      protocolId: true,
      callingConfigId: true,
      facebookFormId: true,
      siteId: true,
      callAttempts: true,
      lastCalledAt: true,
      transcript: true,
      createdAt: true,
      updatedAt: true,
      site: { id: true, name: true },
      protocol: { id: true, name: true },
    };
  }

  create(dto: Partial<LeadEntity>): LeadEntity {
    return this.repo.create(dto);
  }

  async save(entity: LeadEntity): Promise<LeadEntity> {
    return this.repo.save(entity);
  }

  async saveMany(entities: LeadEntity[]): Promise<LeadEntity[]> {
    return this.repo.save(entities);
  }

  async remove(entity: LeadEntity): Promise<LeadEntity> {
    return this.repo.remove(entity);
  }

  async findById(id: string): Promise<LeadEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['site', 'protocol','callingConfig','facebookForm'],
      select: this.baseSelect,
    });
  }

  async findAllPaginated(query: LeadQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      all,
      status,
      source,
      protocolId,
      siteId,
      callingConfigId,
    } = query;

    const where: any = {
      ...(status && { status }),
      ...(source && { source }),
      ...(protocolId && { protocolId }),
      ...(siteId && { siteId }),
      ...(callingConfigId && { callingConfigId }),
    };

    const baseWhere = search
      ? [
          { ...where, firstName: ILike(`%${search}%`) },
          { ...where, lastName: ILike(`%${search}%`) },
          { ...where, phone: ILike(`%${search}%`) },
          { ...where, email: ILike(`%${search}%`) },
        ]
      : where;

    const [data, total] = await this.repo.findAndCount({
      where: baseWhere,
      relations: ['site', 'protocol'],
      select: this.baseSelect,
      order: { [sortBy]: sortOrder },
      ...(all ? {} : { skip: (page - 1) * limit, take: limit }),
    });

    return { data, total, page: all ? 1 : page, limit: all ? total : limit };
  }

  async findPendingByCallingConfig(
    callingConfigId: string,
    limit: number,
  ): Promise<LeadEntity[]> {
    return this.repo.find({
      where: { callingConfigId, status: LeadStatus.PENDING },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  async findByLeadId(id: string): Promise<LeadEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async countPendingByCallingConfig(callingConfigId: string): Promise<number> {
    return this.repo.count({
      where: { callingConfigId, status: LeadStatus.PENDING },
    });
  }
}
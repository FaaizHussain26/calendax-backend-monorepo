// site.service.ts
import { ConflictException, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { SiteRepository } from './site.repository';
import { UsersRepository } from '../user/user.repository';

import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CreateSiteDto, UpdateSiteDto } from './site.dto';
import { SiteEntity } from './site.entity';
import { HelperFunctions } from '../../../common/utils/functions';

@Injectable()
export class SiteService {
  constructor(
    private readonly siteRepository: SiteRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async findAll(query: PaginationDto) {
    return this.siteRepository.findAll(query);
  }
  async findByIds(ids: string[]) {
    return this.siteRepository.findByIds(ids);
  }

  async findById(id: string): Promise<SiteEntity> {
    const site = await this.siteRepository.findById(id);
    if (!site) throw new NotFoundException('Site not found');
    return site;
  }

  async findMySites(userId: string): Promise<SiteEntity[]> {
    return this.siteRepository.findByAssignedUser(userId);
  }

  async create(dto: CreateSiteDto): Promise<SiteEntity | null> {
    const slug = HelperFunctions.generateSlug(dto.name);
    const existing = await this.siteRepository.findOneByCondition({ slug: slug });
    if (existing) throw new ConflictException('Site Already Exists with this name');
    const site = await this.siteRepository.create({ ...dto, slug });
    return this.siteRepository.findById(site.id)!;
  }

  async update(id: string, dto: UpdateSiteDto): Promise<SiteEntity | null> {
    await this.findById(id);

    if (Object.keys(dto).length) {
      await this.siteRepository.update(id, dto);
    }

    return this.siteRepository.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.siteRepository.delete(id);
  }

}

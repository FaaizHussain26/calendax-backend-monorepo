// site.service.ts
import { ConflictException, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { SiteRepository } from './site.repository';
import { UsersRepository } from '../user/user.repository';

import { PaginationDto } from '@libs/common/dto/pagination.dto';
import { CreateSiteDto, UpdateSiteDto } from './site.dto';
import { SiteEntity } from './site.entity';
import { HelperFunctions } from '@libs/common/utils/functions';
import { UserEntity } from '../user/user.entity';

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
    const { userIds, ...siteData } = dto;

    const slug = HelperFunctions.generateSlug(siteData.name);
    const existing = await this.siteRepository.findOneByCondition({ slug });
    if (existing) throw new ConflictException('Site Already Exists with this name');
    let users: UserEntity[] = [];
    if (userIds?.length) {
      users = await this.usersRepository.findByIds(userIds);
      if (users.length !== userIds.length) {
        throw new NotFoundException('One or more users not found');
      }
    }
    const site = await this.siteRepository.create({ ...siteData, slug, users });
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

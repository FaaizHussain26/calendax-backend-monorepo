// site.service.ts
import {
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { SiteRepository } from './site.repository';
import { UsersRepository } from '../user/user.repository';

import { Site } from './site.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CreateSiteDto, UpdateSiteDto } from './site.dto';

@Injectable({ scope: Scope.REQUEST })
export class SiteService {
  constructor(
    private readonly siteRepository: SiteRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async findAll(query: PaginationDto) {
    return this.siteRepository.findAll(query);
  }
  async findByIds(ids:string[] ) {
    return this.siteRepository.findByIds(ids);
  }

  async findById(id: string): Promise<Site> {
    const site = await this.siteRepository.findById(id);
    if (!site) throw new NotFoundException('Site not found');
    return site;
  }

  async findMySites(userId: string): Promise<Site[]> {
    return this.siteRepository.findByAssignedUser(userId);
  }

  async create(dto: CreateSiteDto): Promise<Site|null> {
    const { userIds, ...siteData } = dto;
    const site = await this.siteRepository.create(siteData);

    if (userIds?.length) {
      await this.assignUsers(site.id, userIds);
    }

    return this.siteRepository.findById(site.id)!;
  }

  async update(id: string, dto: UpdateSiteDto): Promise<Site|null> {
    await this.findById(id);
    const { userIds, ...siteData } = dto;

    if (Object.keys(siteData).length) {
      await this.siteRepository.update(id, siteData);
    }

    if (userIds?.length) {
      await this.assignUsers(id, userIds);
    }

    return this.siteRepository.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.siteRepository.softDelete(id);
  }

  private async assignUsers(siteId: string, userIds: string[]): Promise<void> {
    const users = await this.usersRepository.findByIds(userIds);

    if (users.length !== userIds.length) {
      throw new NotFoundException('One or more users not found');
    }

    await this.siteRepository.assignUsers(siteId, users);
  }
}
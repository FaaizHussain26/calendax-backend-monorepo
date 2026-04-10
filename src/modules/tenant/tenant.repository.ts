import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { findTenantDto, TenantResponseDto } from './tenant.dto';
import { TenantEntity } from './tenant.entity';
import { AdminPermissionGroupEntity } from '../permission-group/permission-group.entity';

@Injectable()
export class TenantRepository {
  constructor(
    @InjectRepository(TenantEntity, 'master')
    private readonly tenantRepository: Repository<TenantEntity>,
  ) {}

  async getAllTenants(query: findTenantDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC', status } = query;

    const [data, total] = await this.tenantRepository.findAndCount({
      where: {
        ...(search ? [{ name: ILike(`%${search}%`) }, { slug: ILike(`%${search}%`) }] : {}),
        ...(status && { status }),
      },
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async getByTenantId(id: string) {
    return await this.tenantRepository.findOne({
      where: { id: id },
 
    });
  }
  async getDetailedByTenantId(id: string) {
    return await this.tenantRepository.findOne({
      select: ['id', 'name', 'slug', 'status', 'createdById', 'updatedById', 'dbName', 'permissionGroups',"createdAt","updatedAt"],
      where: { id: id },
      relations: ['permissionGroups', 'permissionGroups.permissions'],
    });
  }
  async findBySlug(slug: string) {
    return await this.tenantRepository.findOne({
      where: { slug: slug },
    });
  }
  async createTenant(payload: Partial<TenantEntity>): Promise<TenantEntity> {
    return this.tenantRepository.save(this.tenantRepository.create(payload));
  }

  async updateTenant(id: string, payload: Partial<TenantEntity>) {
    console.log('update tenant dto:', id, payload);

    const updatedEntity = this.tenantRepository.update(id, payload);
    return updatedEntity;
  }

  async delete(id: string) {
    return await this.tenantRepository.delete(id);
  }
}

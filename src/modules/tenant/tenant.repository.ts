import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { TenantResponseDto } from './tenant.dto';
import { TenantEntity } from './tenant.entity';

@Injectable()
export class TenantRepository {
  constructor(
    @InjectRepository(TenantEntity, 'master')
    private readonly tenantRepository: Repository<TenantEntity>,
  ) {}

  async getAllTenants() {
    const tenants = await this.tenantRepository.find();
    return plainToInstance(TenantResponseDto, tenants);
  }

  async getByTenantId(id: string) {
    console.log("searching tenant:",id)
    return await this.tenantRepository.findOne({
      where: { id: id },
    });
  }
  async findBySlug(slug: string) {
    return await this.tenantRepository.findOne({
      where: { slug: slug },
    });
  }
async createTenant(payload: Partial<TenantEntity>): Promise<TenantEntity> {
  return this.tenantRepository.save(
    this.tenantRepository.create(payload),       // ✅ TypeORM handles junction table automatically
  );
}

  async updateTenant(id: string, payload: Partial<TenantEntity>) {
    const updatedEntity = this.tenantRepository.update(id, payload);
    return updatedEntity;
  }

  async delete(id: string) {
    return await this.tenantRepository.delete(id);
  }
}

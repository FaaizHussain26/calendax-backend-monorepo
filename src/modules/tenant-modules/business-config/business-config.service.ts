import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessConfigEntity } from './business-config.entity';
import { CreateBusinessConfigDto, UpdateBusinessConfigDto } from './business-config.dto';
import { BusinessConfigRepository } from './business-config.repository';
@Injectable()
export class BusinessConfigService {
  constructor(private readonly repo: BusinessConfigRepository) {}

  async get(): Promise<BusinessConfigEntity> {
    const config = await this.repo.findConfig();
    if (!config) {
      throw new NotFoundException('Business config has not been set up yet.');
    }
    return config;
  }

  async upsert(dto: CreateBusinessConfigDto): Promise<BusinessConfigEntity> {
    const existing = await this.repo.findConfig();
    if (existing) {
      Object.assign(existing, dto);
      return this.repo.save(existing);
    }
    return this.repo.save(this.repo.create(dto));
  }

  async remove(): Promise<{ message: string }> {
    const config = await this.get();
    await this.repo.remove(config);
    return { message: 'Business config deleted successfully.' };
  }
}
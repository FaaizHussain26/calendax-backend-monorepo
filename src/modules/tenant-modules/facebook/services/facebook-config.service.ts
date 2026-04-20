import { Injectable, NotFoundException } from '@nestjs/common';
import { FacebookConfigEntity } from '../entities/facebook-config.entity';
import { CreateFacebookConfigDto } from '../dto/facebook-config.dto';
import { FacebookConfigRepository } from '../repositories/facebook-config.repository';

@Injectable()
export class FacebookConfigService {
  constructor(private readonly repo: FacebookConfigRepository) {}

  async get(): Promise<FacebookConfigEntity> {
    const config = await this.repo.findConfig();
    if (!config) {
      throw new NotFoundException('Facebook config has not been set up yet.');
    }
    return config;
  }

  async upsert(dto: CreateFacebookConfigDto): Promise<FacebookConfigEntity> {
    const existing = await this.repo.findConfig();
    if (existing) {
      Object.assign(existing, dto);
      return this.repo.save(existing);
    }
    return this.repo.save(this.repo.create(dto));
  }

  async disconnect(): Promise<{ message: string }> {
    const config = await this.get();
    config.isConnected = false;
    config.accessToken = null;
    await this.repo.save(config);
    return { message: 'Facebook disconnected successfully.' };
  }

  async remove(): Promise<{ message: string }> {
    const config = await this.get();
    await this.repo.remove(config);
    return { message: 'Facebook config deleted successfully.' };
  }
}
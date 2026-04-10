import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PageEntity } from './page.entity';
import { ILike, In, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { PageResponseDto } from './page.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RedisService } from '../../services/redis/redis.service';
import { AdminPermissions } from '../admin/entities/admin-permissions.entity';

@Injectable()
export class PageRepository {
  constructor(
    @InjectRepository(PageEntity, 'master')
    private readonly pageRepository: Repository<PageEntity>,
  ) {}
  async find() {
    return await this.pageRepository.find();
  }
  async findAllPages(query: PaginationDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC', all = false } = query;

    const [data, total] = await this.pageRepository.findAndCount({
      where: search ? [{ name: ILike(`%${search}%`) }, { slug: ILike(`%${search}%`) }] : {},
      order: { [sortBy]: sortOrder },
      ...(all ? {} : { skip: (page - 1) * limit, take: limit }),
    });

    return { data, total, page, limit };
  }

  async findByPageId(id: string) {
    return await this.pageRepository.findOne({
      where: { id: id },
    });
  }
  async findBySlug(slug: string) {
    return await this.pageRepository.findOne({
      where: { slug: slug },
    });
  }
async findByIds(ids: string[]): Promise<PageEntity[]> {
  return this.pageRepository.find({ where: { id: In(ids) } });
}
  async createPage(payload: Partial<PageEntity>) {
    const createdEntity = this.pageRepository.create(payload);
    return await this.pageRepository.save(createdEntity);
  }

  async updatePage(id: string, payload: Partial<PageEntity>) {
    const updatedEntity = this.pageRepository.update(id, payload);
    return updatedEntity;
  }

  async delete(id: string) {
    return await this.pageRepository.delete(id);
  }
}

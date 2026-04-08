import { Inject, Injectable, Scope } from '@nestjs/common';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { AdminPermissionGroupEntity } from './permission-group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AdminPermissionGroupRepository {
  constructor(
    @InjectRepository(AdminPermissionGroupEntity, 'master')
    private readonly repo: Repository<AdminPermissionGroupEntity>,
  ) {}

  async create(payload: Partial<AdminPermissionGroupEntity>): Promise<AdminPermissionGroupEntity> {
    return this.repo.save(this.repo.create(payload));
  }

  async findAll(query: PaginationDto): Promise<{
    data: AdminPermissionGroupEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const [data, total] = await this.repo.findAndCount({
      relations: { permissions: true },
      where: search ? [{ name: ILike(`%${search}%`) }, { description: ILike(`%${search}%`) }] : {},
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<AdminPermissionGroupEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: { permissions: true },
    });
  }
  async findByIds(ids: string[]): Promise<AdminPermissionGroupEntity[]> {
    return this.repo.find({
      where: { id: In(ids) },
    });
  }
  async findDetailedByIds(ids: string[]): Promise<AdminPermissionGroupEntity[]> {
    return this.repo.find({
      where: { id: In(ids) },
      relations: { permissions: true },
    });
  }
  async findByName(name: string): Promise<AdminPermissionGroupEntity | null> {
    return this.repo.findOne({
      where: { name },
    });
  }
  async findBySlug(slug: string): Promise<AdminPermissionGroupEntity | null> {
    return this.repo.findOne({ where: { slug } });
  }
  async findDetailedByCondition(
    condition: FindOptionsWhere<AdminPermissionGroupEntity>,
  ): Promise<AdminPermissionGroupEntity | null> {
    return this.repo.findOne({
      where: condition,
      relations: { permissions: true },
      order: { createdAt: 'DESC' },
    });
  }
  async update(id: string, payload: Partial<AdminPermissionGroupEntity>): Promise<void> {
    await this.repo.update(id, payload);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async restore(id: string): Promise<void> {
    await this.repo.restore(id);
  }
}

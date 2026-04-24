// src/modules/tenant-modules/rbac/permission-group/permission-group.repository.ts
import { Inject, Injectable, Scope } from '@nestjs/common';
import { ILike, In, Repository } from 'typeorm';
import { PermissionGroupEntity } from './permission-group.entity';
import { PaginationDto } from '@libs/common/dto/pagination.dto';

@Injectable({ scope: Scope.REQUEST })
export class PermissionGroupRepository {
  constructor(
    @Inject(`${PermissionGroupEntity.name}Repository`)
    private readonly repo: Repository<PermissionGroupEntity>,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(payload: Partial<PermissionGroupEntity>): Promise<PermissionGroupEntity> {
    return this.repo.save(this.repo.create(payload));
  }

  // ─── Find ─────────────────────────────────────────────────────────────────

  async findAll(query: PaginationDto): Promise<{
    data: PermissionGroupEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC', all = false } = query;

    const [data, total] = await this.repo.findAndCount({
      relations: { permissions: true },
      where: search ? { name: ILike(`%${search}%`) } : {},
      order: { [sortBy]: sortOrder },
      ...(all ? {} : { skip: (page - 1) * limit, take: limit }),
    });

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<PermissionGroupEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: { permissions: true },
    });
  }

  async findByName(name: string): Promise<PermissionGroupEntity | null> {
    return this.repo.findOne({ where: { name } });
  }

  async findBySlug(slug: string): Promise<PermissionGroupEntity | null> {
    return this.repo.findOne({ where: { slug } });
  }

  async findByPermissionIds(ids: string[]): Promise<PermissionGroupEntity[] | null> {
    return await this.repo.find({
      where: {
        id: In(ids),
      },
    });
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(id: string, payload: Partial<PermissionGroupEntity>): Promise<void> {
    await this.repo.update(id, payload);
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async restore(id: string): Promise<void> {
    await this.repo.restore(id);
  }
}

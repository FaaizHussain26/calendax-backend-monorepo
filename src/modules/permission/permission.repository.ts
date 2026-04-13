// src/modules/admin/permission/permission.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { AdminPermissionEntity } from './permission.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AdminPermissionRepository {
  constructor(
    @InjectRepository(AdminPermissionEntity, 'master')
    private readonly repo: Repository<AdminPermissionEntity>,
  ) {}

  // ─── Count ───────────────────────────────────────────────────────────────
  async count(): Promise<Number> {
    return await this.repo.count();
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(payload: Partial<AdminPermissionEntity>): Promise<AdminPermissionEntity> {
    return this.repo.save(this.repo.create(payload));
  }

  // ─── Find ─────────────────────────────────────────────────────────────────

  async findAll(query: PaginationDto): Promise<{
    data: AdminPermissionEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const [data, total] = await this.repo.findAndCount({
      relations: { group: true },
      where: search ? [{ name: ILike(`%${search}%`) }, { description: ILike(`%${search}%`) }] : {},
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<AdminPermissionEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: { group: true },
    });
  }

  async findByKey(key: string): Promise<AdminPermissionEntity | null> {
    return this.repo.findOne({ where: { key } });
  }

  async findByGroupId(groupId: string): Promise<AdminPermissionEntity[]> {
    return this.repo.find({
      where: { groupId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByIds(ids: string[]): Promise<AdminPermissionEntity[]> {
    return this.repo.find({
      where: { id: In(ids) },
    });
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(id: string, payload: Partial<AdminPermissionEntity>): Promise<void> {
    await this.repo.update(id, payload);
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async restore(id: string): Promise<void> {
    await this.repo.restore(id);
  }
}

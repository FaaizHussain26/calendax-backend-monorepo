// src/modules/tenant-modules/rbac/permission/permission.repository.ts
import { Inject, Injectable, Scope } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { PermissionEntity } from './permission.entity';

@Injectable({ scope: Scope.REQUEST })
export class PermissionRepository {
  constructor(
    @Inject(`${PermissionEntity.name}Repository`)
    private readonly repo: Repository<PermissionEntity>,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(payload: Partial<PermissionEntity>): Promise<PermissionEntity> {
    return this.repo.save(this.repo.create(payload));
  }

  // ─── Find ─────────────────────────────────────────────────────────────────

  async findAll(): Promise<PermissionEntity[]> {
    return this.repo.find({
      relations: { group: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<PermissionEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: { group: true },
    });
  }

  async findByKey(key: string): Promise<PermissionEntity | null> {
    return this.repo.findOne({ where: { key } });
  }

  async findByGroupId(groupId: string): Promise<PermissionEntity[]> {
    return this.repo.find({
      where: { groupId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByIds(ids: string[]): Promise<PermissionEntity[]> {
    return this.repo.find({
      where: { id: In(ids) },
    });
  }

  // ─── Update ───────────────────────────────────────────────────────────────

   async update(
    id: string,
    payload: Partial<PermissionEntity>,
  ): Promise<void> {
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
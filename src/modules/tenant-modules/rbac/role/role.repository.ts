// src/modules/tenant-modules/rbac/role/role.repository.ts
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RoleEntity } from './role.entity';

@Injectable({ scope: Scope.REQUEST })
export class RoleRepository {
  constructor(
    @Inject('RoleEntityRepository')
    private readonly repo: Repository<RoleEntity>,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(payload: Partial<RoleEntity>): Promise<RoleEntity> {
    return this.repo.save(this.repo.create(payload));
  }

  // ─── Find ─────────────────────────────────────────────────────────────────

  async findAll(): Promise<RoleEntity[]> {
    return this.repo.find({
      relations: { permissions: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<RoleEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: { permissions: true },
    });
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    return this.repo.findOne({
      where: { name },
      relations: { permissions: true },
    });
  }

  async findDefault(): Promise<RoleEntity | null> {
    return this.repo.findOne({
      where: { isDefault: true },
      relations: { permissions: true },
    });
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(
    id: string,
    payload: Partial<RoleEntity>,
  ): Promise<RoleEntity> {
   return await this.repo.save({ id, ...payload }); // ✅ use save for relation updates
   ;
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async restore(id: string): Promise<void> {
    await this.repo.restore(id);
  }
}
// src/modules/admin/permission/permission.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AdminPermissionEntity } from './permission.entity';

@Injectable()
export class AdminPermissionRepository {
  constructor(
    @InjectRepository(AdminPermissionEntity, 'master')
    private readonly repo: Repository<AdminPermissionEntity>,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(
    payload: Partial<AdminPermissionEntity>,
  ): Promise<AdminPermissionEntity> {
    return this.repo.save(this.repo.create(payload));
  }

  // ─── Find ─────────────────────────────────────────────────────────────────

  async findAll(): Promise<AdminPermissionEntity[]> {
    return this.repo.find({
      relations: { group: true },
      order: { createdAt: 'DESC' },
    });
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

  async update(
    id: string,
    payload: Partial<AdminPermissionEntity>,
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
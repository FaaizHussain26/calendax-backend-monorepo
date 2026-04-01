// src/modules/admin/admin.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { AdminEntity } from './entities/admin.entity';
import { AdminPermissions } from './entities/admin-permissions.entity';
import { AdminResponseDto } from './admin.dto';

@Injectable()
export class AdminRepository {
  constructor(
    @InjectRepository(AdminEntity, 'master')
    private readonly adminRepo: Repository<AdminEntity>,
    @InjectRepository(AdminPermissions, 'master')
    private readonly permissionRepo: Repository<AdminPermissions>,
  ) {}

  // ─── Admin ────────────────────────────────────────────────────────────────

  async findAll(): Promise<AdminResponseDto[]> {
    const admins = await this.adminRepo.find({
      order: { createdAt: 'DESC' },
    });
    return plainToInstance(AdminResponseDto, admins, {
      excludeExtraneousValues: true,
    });
  }

  async findById(id: string): Promise<AdminEntity | null> {
    return this.adminRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<AdminEntity | null> {
    return this.adminRepo.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<AdminEntity | null> {
    return this.adminRepo.findOne({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,                    // ✅ explicitly include password
        role: true,
        isActive: true,
      },
    });
  }

  async create(payload: Partial<AdminEntity>): Promise<AdminEntity> {
    return this.adminRepo.save(this.adminRepo.create(payload));
  }

  async update(
    id: string,
    payload: Partial<AdminEntity>,
  ): Promise<AdminEntity|null> {
    await this.adminRepo.update(id, payload);
    return this.findById(id);              // ✅ return updated entity
  }

  async softDelete(id: string): Promise<void> {
    await this.adminRepo.softDelete(id);
  }

  // ─── Permissions ──────────────────────────────────────────────────────────

  async findPermissions(adminId: string): Promise<AdminPermissions[]> {
    return this.permissionRepo.find({
      where: { adminId },                  // ✅ filter by adminId
      relations: { page: true },           // ✅ load page relation
    });
  }

  async upsertPermission(
    payload: Partial<AdminPermissions>,
  ): Promise<AdminPermissions|null> {
    const existing = await this.permissionRepo.findOne({
      where: { adminId: payload.adminId, pageId: payload.pageId },
    });

    if (existing) {
      await this.permissionRepo.update(existing.id, payload);
      return this.permissionRepo.findOne({ where: { id: existing.id } });
    }

    return this.permissionRepo.save(this.permissionRepo.create(payload));
  }
}
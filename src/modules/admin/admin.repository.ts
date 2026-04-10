// src/modules/admin/admin.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { AdminEntity } from './entities/admin.entity';
import { AdminPermissions } from './entities/admin-permissions.entity';
import { AdminResponseDto } from './admin.dto';
import { PageRepository } from '../page/page.repository';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AdminRoles } from '../../common/enums/admin.enum';

@Injectable()
export class AdminRepository {
  constructor(
    @InjectRepository(AdminEntity, 'master')
    private readonly adminRepo: Repository<AdminEntity>,
    @InjectRepository(AdminPermissions, 'master')
    private readonly permissionRepo: Repository<AdminPermissions>,
    private readonly pageRepository: PageRepository,
  ) {}

  // ─── Admin ────────────────────────────────────────────────────────────────

  async findAll(
    query: PaginationDto,
    userId: string,
  ): Promise<{ data: AdminResponseDto[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC', all = false } = query;
    const baseWhere = { id: Not(userId), role: Not(AdminRoles.SUPER_ADMIN) };
    const [admins, total] = await this.adminRepo.findAndCount({
      where: search
        ? [
            { ...baseWhere, name: ILike(`%${search}%`) },
            { ...baseWhere, email: ILike(`%${search}%`) },
          ]
        : baseWhere,
      order: { [sortBy]: sortOrder },
      ...(all ? {} : { skip: (page - 1) * limit, take: limit }),
    });

    return {
      data: admins,
      total,
      page,
      limit,
    };
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
        password: true, // ✅ explicitly include password
        role: true,
        isActive: true,
      },
    });
  }

  async create(payload: Partial<AdminEntity>): Promise<AdminEntity> {
    return this.adminRepo.save(this.adminRepo.create(payload));
  }

  async update(id: string, payload: Partial<AdminEntity>): Promise<AdminEntity | null> {
    await this.adminRepo.update(id, payload);
    return this.findById(id); // ✅ return updated entity
  }

  async softDelete(id: string): Promise<void> {
    await this.adminRepo.softDelete(id);
  }
  async delete(id: string): Promise<void> {
    await this.adminRepo.delete(id);
  }


  async findPermissions(adminId: string): Promise<AdminPermissions[]> {
    return this.permissionRepo.find({
      where: { adminId },
      relations: { page: true },
    });
  }
async findPermissions2(adminId: string) {
  const permissions = await this.permissionRepo.find({
    where: { adminId },
  });

  // manually fetch pages
  const pageIds = permissions.map((p) => p.pageId);
  const pages = await this.pageRepository.findByIds(pageIds);

  // map pages back to permissions
  return permissions.map((perm) => ({
    ...perm,
    page: pages.find((p) => p.id === perm.pageId) ?? null,
  }));
}
  async upsertPermission(payload: Partial<AdminPermissions>): Promise<AdminPermissions | null> {
    const existing = await this.permissionRepo.findOne({
      where: { adminId: payload.adminId, pageId: payload.pageId },
    });

    if (existing) {
      await this.permissionRepo.update(existing.id, payload);
      return this.permissionRepo.findOne({ where: { id: existing.id } });
    }

    return this.permissionRepo.save(this.permissionRepo.create(payload));
  }

  async removePermission(adminId: string, pageId: string): Promise<void> {
    await this.permissionRepo.delete({ adminId, pageId });
  }
  async findAllPagesWithAdminPermissions(userId: string) {
    const data = await this.pageRepository.find();
    const adminPermissions = await this.permissionRepo.find({
      where: { adminId: userId },
    });
    const pagesWithPermissions = data?.map((page) => {
      const permission = adminPermissions.find((p) => p.pageId === page.id);
      return {
        ...page,
        permissions: {
          read: permission?.read ?? false,
          write: permission?.write ?? false,
          update: permission?.update ?? false,
          delete: permission?.delete ?? false,
        },
      };
    });
    return pagesWithPermissions;
  }
}

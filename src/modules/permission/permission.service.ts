// src/modules/admin/permission/permission.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AdminPermissionRepository } from './permission.repository';
import { AdminPermissionGroupRepository } from '../permission-group/permission-group.repository';
import { CreatePermissionDto, UpdatePermissionDto } from '../../common/dto/permission.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AdminPermissionService {
  constructor(
    private readonly permissionRepo: AdminPermissionRepository,
    private readonly permissionGroupRepo: AdminPermissionGroupRepository,
  ) {}

  async findAll(query: PaginationDto) {
    return this.permissionRepo.findAll(query);
  }

  async findById(id: string) {
    const permission = await this.permissionRepo.findById(id);
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  async findByGroup(groupId: string) {
    const group = await this.permissionGroupRepo.findById(groupId);
    if (!group) throw new NotFoundException('Permission group not found');
    return this.permissionRepo.findByGroupId(groupId);
  }

  async create(groupId: string, dto: CreatePermissionDto) {
    const group = await this.permissionGroupRepo.findById(groupId);
    if (!group) throw new NotFoundException('Permission group not found');

    const existing = await this.permissionRepo.findByKey(dto.key);
    if (existing) throw new ConflictException('Permission key already exists');

    return this.permissionRepo.create({ ...dto, groupId });
  }

  async update(id: string, dto: UpdatePermissionDto) {
    const permission = await this.permissionRepo.findById(id);
    if (!permission) throw new NotFoundException('Permission not found');

    if (dto.key && dto.key !== permission.key) {
      const existing = await this.permissionRepo.findByKey(dto.key);
      if (existing) {
        throw new ConflictException('Permission key already in use');
      }
    }

    await this.permissionRepo.update(id, dto);
    return this.permissionRepo.findById(id);
  }

  async delete(id: string) {
    const permission = await this.permissionRepo.findById(id);
    if (!permission) throw new NotFoundException('Permission not found');
    await this.permissionRepo.softDelete(id);
    return { message: 'Permission deleted successfully' };
  }

  async restore(id: string) {
    const permission = await this.permissionRepo.findById(id);
    if (!permission) throw new NotFoundException('Permission not found');
    await this.permissionRepo.restore(id);
    return { message: 'Permission restored successfully' };
  }
}

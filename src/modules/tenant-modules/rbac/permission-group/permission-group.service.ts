// src/modules/tenant-modules/rbac/permission-group/permission-group.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PermissionGroupRepository } from './permission-group.repository';
import {
  CreatePermissionGroupDto,
  UpdatePermissionGroupDto,
} from './permission-group.dto';

@Injectable()
export class PermissionGroupService {
  constructor(
    private readonly permissionGroupRepository: PermissionGroupRepository,
  ) {}

  async findAll() {
    return this.permissionGroupRepository.findAll();
  }

  async findById(id: string) {
    const group = await this.permissionGroupRepository.findById(id);
    if (!group) throw new NotFoundException('Permission group not found');
    return group;
  }

  async create(dto: CreatePermissionGroupDto) {
    const existing = await this.permissionGroupRepository.findByName(dto.name);
    if (existing) throw new ConflictException('Permission group already exists');

    return this.permissionGroupRepository.create({
      name: dto.name,
      description: dto.description,
    });
  }

  async update(id: string, dto: UpdatePermissionGroupDto) {
    const group = await this.permissionGroupRepository.findById(id);
    if (!group) throw new NotFoundException('Permission group not found');

    if (dto.name && dto.name !== group.name) {
      const existing = await this.permissionGroupRepository.findByName(
        dto.name,
      );
      if (existing) {
        throw new ConflictException('Permission group name already in use');
      }
    }

    await this.permissionGroupRepository.update(id, dto);
    return this.permissionGroupRepository.findById(id);
  }

  async delete(id: string) {
    const group = await this.permissionGroupRepository.findById(id);
    if (!group) throw new NotFoundException('Permission group not found');
    await this.permissionGroupRepository.softDelete(id);
    return { message: 'Permission group deleted successfully' };
  }

  async restore(id: string) {
    const group = await this.permissionGroupRepository.findById(id);
    if (!group) throw new NotFoundException('Permission group not found');
    await this.permissionGroupRepository.restore(id);
    return { message: 'Permission group restored successfully' };
  }
}
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
} from '../../../../common/dto/permission.dto';
import { HelperFunctions } from '../../../../common/utils/functions';
import { PermissionRepository } from '../permission/permission.repository';

@Injectable()
export class PermissionGroupService {
  constructor(
    private readonly permissionGroupRepo: PermissionGroupRepository,
    private readonly permissionRepo: PermissionRepository,
  ) {}

  async findAll() {
    return this.permissionGroupRepo.findAll();
  }

  async findById(id: string) {
    const group = await this.permissionGroupRepo.findById(id);
    if (!group) throw new NotFoundException('Permission group not found');
    return group;
  }

  async create(dto: CreatePermissionGroupDto) {
      const slug =HelperFunctions.generateSlug(dto.name)

    const existing = await this.permissionGroupRepo.findBySlug(slug);
    if (existing) throw new ConflictException('Permission group already exists');

    const group = await this.permissionGroupRepo.create({
      name: dto.name,
      slug,
      href: dto.href,
      description: dto.description,
    });

    // ✅ auto seed CRUD permissions
    const actions = ['create', 'read', 'update', 'delete'];
    for (const action of actions) {
      await this.permissionRepo.create({
        key: `${slug}.${action}`,
        name: `${action.charAt(0).toUpperCase() + action.slice(1)} ${dto.name}`,
        groupId: group.id,
      });
    }

    return this.permissionGroupRepo.findById(group.id);
  }

  async update(id: string, dto: UpdatePermissionGroupDto) {
    const group = await this.permissionGroupRepo.findById(id);
    if (!group) throw new NotFoundException('Permission group not found');

    if (dto.name && dto.name !== group.name) {
      const slug =HelperFunctions.generateSlug(group.name)
      const existing = await this.permissionGroupRepo.findBySlug(slug);
      if (existing) {
        throw new ConflictException('Permission group name already in use');
      }
      await this.permissionGroupRepo.update(id, {
        ...dto,
        slug,                                
      });
    }

    else await this.permissionGroupRepo.update(id, dto);
    return this.permissionGroupRepo.findById(id)
  }

  async delete(id: string) {
    const group = await this.permissionGroupRepo.findById(id);
    if (!group) throw new NotFoundException('Permission group not found');
    await this.permissionGroupRepo.softDelete(id);
    return { message: 'Permission group deleted successfully' };
  }

  async restore(id: string) {
    const group = await this.permissionGroupRepo.findById(id);
    if (!group) throw new NotFoundException('Permission group not found');
    await this.permissionGroupRepo.restore(id);
    return { message: 'Permission group restored successfully' };
  }
}
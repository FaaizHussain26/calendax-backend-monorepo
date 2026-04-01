import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminPermissionGroupRepository } from './permission-group.repository';
import {
  CreatePermissionDto,
  CreatePermissionGroupDto,
  UpdatePermissionGroupDto,
} from '../../common/dto/permission.dto';
import { HelperFunctions } from '../../common/utils/functions';
import { AdminPermissionRepository } from '../permission/permission.repository';

// src/modules/admin/permission-group/permission-group.service.ts
@Injectable()
export class AdminPermissionGroupService {
  constructor(
    private readonly permissionGroupRepo: AdminPermissionGroupRepository,
    private readonly permissionRepo: AdminPermissionRepository,
  ) {}

  async create(dto: CreatePermissionGroupDto) {
    const existing = await this.permissionGroupRepo.findByName(dto.name);
    if (existing)
      throw new ConflictException('Permission group already exists');
    const slug = HelperFunctions.generateSlug(dto.name);
    const group = await this.permissionGroupRepo.create({
      name: dto.name,
      slug: slug,
      href: dto.href,
      description: dto.description,
    });

    // ✅ auto seed CRUD permissions on group creation
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

  async addPermission(groupId: string, dto: CreatePermissionDto) {
    const group = await this.permissionGroupRepo.findById(groupId);
    if (!group) throw new NotFoundException('Permission group not found');

    const existing = await this.permissionRepo.findByKey(dto.key);
    if (existing) throw new ConflictException('Permission key already exists');

    return this.permissionRepo.create({
      ...dto,
      groupId,
    });
  }

  async findAll() {
    return this.permissionGroupRepo.findAll();
  }

  async findById(id: string) {
    const group = await this.permissionGroupRepo.findById(id);
    if (!group) throw new NotFoundException('Permission group not found');
    return group;
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
 else   await this.permissionGroupRepo.update(id, dto);
    return this.permissionGroupRepo.findById(id);
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

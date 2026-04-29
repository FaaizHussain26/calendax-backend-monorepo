// src/modules/tenant-modules/rbac/permission-group/permission-group.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { CreatePermissionGroupDto, UpdatePermissionGroupDto } from '../../../../common/dto/permission.dto';
import { TenantUserRoles } from '../../../../common/enums/tenant.enum';
import { TokenUser } from '../../../../common/interfaces/request.interface';
import { HelperFunctions } from '../../../../common/utils/functions';
import { UsersRepository } from '../../user/user.repository';
import { PermissionRepository } from '../permission/permission.repository';
import { PermissionGroupRepository } from './permission-group.repository';

@Injectable()
export class PermissionGroupService {
  constructor(
    private readonly permissionGroupRepo: PermissionGroupRepository,
    private readonly permissionRepo: PermissionRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async findAll(query: PaginationDto) {
    return this.permissionGroupRepo.findAll(query);
  }

  async findById(id: string) {
    const group = await this.permissionGroupRepo.findById(id);
    if (!group) throw new NotFoundException('Permission group not found');
    return group;
  }

  async getMyPermissionsGroup(user: TokenUser) {
    const isTenantAdmin = user.userType === TenantUserRoles.TENANT_ADMIN;
    if (isTenantAdmin) {
      const permissionGroup = await this.permissionGroupRepo.findAll({ all: true });
      return permissionGroup;
    }
    let data;
    data = await this.usersRepository.findDetailsById(user.id);
    const rolePermissions = data.role?.permissions?.map((p) => p.groupId) ?? [];
    const directPermissions = data.permissions?.map((p) => p.groupId) ?? [];
    const allPermissions = [...new Set([...rolePermissions, ...directPermissions])];
    const permissionGroup = await this.permissionGroupRepo.findByPermissionIds(allPermissions);

    return permissionGroup;
  }

  async create(dto: CreatePermissionGroupDto) {
    const slug = HelperFunctions.generateSlug(dto.name);

    const existing = await this.permissionGroupRepo.findBySlug(slug);
    if (existing) throw new ConflictException('Permission group already exists');

    const group = await this.permissionGroupRepo.create({
      name: dto.name,
      icon: dto.icon,
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
      const slug = HelperFunctions.generateSlug(group.name);
      const existing = await this.permissionGroupRepo.findBySlug(slug);
      if (existing) {
        throw new ConflictException('Permission group name already in use');
      }
      await this.permissionGroupRepo.update(id, {
        ...dto,
        slug,
      });
    } else await this.permissionGroupRepo.update(id, dto);
    return this.permissionGroupRepo.findById(id);
  }

  async delete(id: string) {
    const group = await this.permissionGroupRepo.findById(id);
    if (!group) throw new NotFoundException('Permission group not found');
    await this.permissionGroupRepo.delete(id);
    return { message: 'Permission group deleted successfully' };
  }

  async restore(id: string) {
    const group = await this.permissionGroupRepo.findById(id);
    if (!group) throw new NotFoundException('Permission group not found');
    await this.permissionGroupRepo.restore(id);
    return { message: 'Permission group restored successfully' };
  }
}

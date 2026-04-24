// src/modules/tenant-modules/rbac/role/role.service.ts
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { PermissionRepository } from '../permission/permission.repository';
import { AssignPermissionsDto, CreateRoleDto, UpdateRoleDto } from './role.dto';
import { PermissionEntity } from '../permission/permission.entity';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepo: RoleRepository,
    private readonly permissionRepo: PermissionRepository,
  ) {}

  async findAll() {
    return this.roleRepo.findAll();
  }

  async findById(id: string) {
    const role = await this.roleRepo.findById(id);
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.roleRepo.findByName(dto.name);
    if (existing) throw new ConflictException('Role already exists');

    // validate permissions if provided
    let permissions: PermissionEntity[] = [];
    if (dto.permissionIds?.length) {
      permissions = await this.permissionRepo.findByIds(dto.permissionIds);
      if (permissions.length !== dto.permissionIds.length) {
        throw new NotFoundException('One or more permissions not found');
      }
    }

    // if setting as default — unset previous default first
    if (dto.isDefault) {
      await this.unsetCurrentDefault();
    }

    return this.roleRepo.create({
      name: dto.name,
      description: dto.description,
      isDefault: dto.isDefault ?? false,
      permissions,
    });
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.roleRepo.findById(id);
    if (!role) throw new NotFoundException('Role not found');

    if (dto.name && dto.name !== role.name) {
      const existing = await this.roleRepo.findByName(dto.name);
      if (existing) throw new ConflictException('Role name already in use');
    }

    // validate permissions if provided
    let permissions = role.permissions; // keep existing if not provided
    if (dto.permissionIds?.length) {
      permissions = await this.permissionRepo.findByIds(dto.permissionIds);
      if (permissions.length !== dto.permissionIds.length) {
        throw new NotFoundException('One or more permissions not found');
      }
    }

    // if setting as default — unset previous default first
    if (dto.isDefault && !role.isDefault) {
      await this.unsetCurrentDefault();
    }

    return this.roleRepo.update(id, {
      name: dto.name,
      description: dto.description,
      isDefault: dto.isDefault,
      permissions,
    });
  }

  async assignPermissions(id: string, dto: AssignPermissionsDto) {
    const role = await this.roleRepo.findById(id);
    if (!role) throw new NotFoundException('Role not found');

    const permissions = await this.permissionRepo.findByIds(dto.permissionIds);
    if (permissions.length !== dto.permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }

    return this.roleRepo.update(id, { permissions });
  }

  async revokePermissions(id: string, dto: AssignPermissionsDto) {
    const role = await this.roleRepo.findById(id);
    if (!role) throw new NotFoundException('Role not found');

    // remove specified permissions from role
    const remaining = role.permissions.filter((p) => !dto.permissionIds.includes(p.id));

    return this.roleRepo.update(id, { permissions: remaining });
  }

  async delete(id: string) {
    const role = await this.roleRepo.findById(id);
    if (!role) throw new NotFoundException('Role not found');

    if (role.isDefault) {
      throw new BadRequestException('Cannot delete default role. Assign another default role first');
    }

    await this.roleRepo.softDelete(id);
    return { message: 'Role deleted successfully' };
  }

  async restore(id: string) {
    const role = await this.roleRepo.findById(id);
    if (!role) throw new NotFoundException('Role not found');
    await this.roleRepo.restore(id);
    return { message: 'Role restored successfully' };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async unsetCurrentDefault() {
    const currentDefault = await this.roleRepo.findDefault();
    if (currentDefault) {
      await this.roleRepo.update(currentDefault.id, { isDefault: false });
    }
  }
}

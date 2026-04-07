// src/modules/tenant-modules/user/users.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './user.repository';
import { RoleRepository } from '../rbac/role/role.repository';
import { PermissionRepository } from '../rbac/permission/permission.repository';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './user.dto';
import { HelperFunctions } from '../../../common/utils/functions';
import { PermissionEntity } from '../rbac/permission/permission.entity';
import { ConfigService } from '@nestjs/config';
import { SiteEntity } from '../site/site.entity';
import { SiteService } from '../site/site.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly configService:ConfigService,
      private readonly siteService: SiteService,
  ) {}

  async findAll(query: UserQueryDto) {
    return this.usersRepository.findAllWithDetails(query);
  }

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    if (dto.roleId) {
      const role = await this.roleRepository.findById(dto.roleId);
      if (!role) throw new NotFoundException('Role not found');
    }

    // validate direct permissions
    let permissions: PermissionEntity[] = [];
    if (dto.permissionIds?.length) {
      permissions = await this.permissionRepository.findByIds(dto.permissionIds);
      if (permissions.length !== dto.permissionIds.length) {
        throw new NotFoundException('One or more permissions not found');
      }
    }
let sites: SiteEntity[] = [];
  if (dto.siteIds?.length) {
    sites = await this.siteService.findByIds(dto.siteIds);
    if (sites.length !== dto.siteIds.length) {
      throw new NotFoundException('One or more sites not found');
    }
  }
    const rawPassword = this.configService.get<string>('defaultPassword');
    const hashed = await bcrypt.hash(rawPassword, 10);

    const user = await this.usersRepository.create({
      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      password: hashed,
      userType: dto.userType,
      roleId: dto.roleId ?? undefined,
      permissions,
      isActive: true,
    });

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,
      roleId: user.roleId,
    };
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (dto.roleId) {
      const role = await this.roleRepository.findById(dto.roleId);
      if (!role) throw new NotFoundException('Role not found');
    }

    let permissions = user.permissions;
    if (dto.permissionIds?.length) {
      permissions = await this.permissionRepository.findByIds(dto.permissionIds);
      if (permissions.length !== dto.permissionIds.length) {
        throw new NotFoundException('One or more permissions not found');
      }
    }

    return this.usersRepository.update(id, {
      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      userType: dto.userType,
      roleId: dto.roleId ?? undefined,
      isActive: dto.isActive,
      permissions,
    });
  }

  async delete(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepository.softDelete(id);
    return { message: 'User deleted successfully' };
  }

  async restore(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepository.restore(id);
    return { message: 'User restored successfully' };
  }

  async toggleActive(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepository.update(id, { isActive: !user.isActive });
    return {
      message: `User ${!user.isActive ? 'activated' : 'deactivated'} successfully`,
    };
  }
}

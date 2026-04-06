// src/modules/admin/admin.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { AdminRoles } from '../../enums/admin.enum';
import { AdminRepository } from './admin.repository';
import {
  AdminResponseDto,
  AssignPagePermissionDto,
  CreateAdminDto,
  RemovePagePermissionDto,
  UpdateAdminDto,
} from './admin.dto';
import { JwtHelper } from '../../common/jwt/jwt.provider';
import { JwtPayload, TokenUser } from '../../common/interfaces/request.interface';
import { PageService } from '../page/page.service';
import { PageWithPermissions } from '../../common/interfaces/page-permissions.interface';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly jwtHelper: JwtHelper,
    private readonly pageService: PageService,
  ) {}

  async logIn(email: string, password: string) {
    // ✅ use findByEmailWithPassword — password has select:false on entity
    const admin = await this.adminRepository.findByEmailWithPassword(email);
    if (!admin) throw new NotFoundException('Admin not found');
    if (!admin.isActive) throw new UnauthorizedException('Account is inactive');

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    // ✅ fetch permissions for ADMIN role — SUPER_ADMIN gets all
    let permissions: string[] = [];
    if (admin.role === AdminRoles.ADMIN) {
      const adminPermissions = await this.adminRepository.findPermissions(admin.id);
      // convert page-based permissions to flat permission keys
      permissions = adminPermissions.flatMap((p) => {
        const keys: string[] = [];
        if (p.read) keys.push(`${p.page.slug}.read`);
        if (p.write) keys.push(`${p.page.slug}.write`);
        if (p.update) keys.push(`${p.page.slug}.update`);
        if (p.delete) keys.push(`${p.page.slug}.delete`);
        return keys;
      });
    }

    // ✅ pass permissions to issueToken — cached in Redis
    return this.jwtHelper.issueToken(
      {
        id: admin.id,
        role: admin.role,
        isActive: admin.isActive,
      },
      permissions,
    );
  }

  async getAllAdmins() {
    return this.adminRepository.findAll();
  }

  async getAdminById(id: string) {
    const admin = await this.adminRepository.findById(id);
    if (!admin) throw new NotFoundException('Admin not found');
    return plainToInstance(AdminResponseDto, admin, {
      excludeExtraneousValues: true,
    });
  }

  async createAdmin(dto: CreateAdminDto) {
    const existing = await this.adminRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already exists');

    const hashed = await bcrypt.hash(dto.password, 10);

    const admin = await this.adminRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: dto.role ?? AdminRoles.ADMIN, // ✅ default to ADMIN
      isActive: dto.isActive ?? true,
    });

    return plainToInstance(AdminResponseDto, admin, {
      excludeExtraneousValues: true,
    });
  }

  async updateAdmin(id: string, dto: UpdateAdminDto) {
    const existing = await this.adminRepository.findById(id);
    if (!existing) throw new NotFoundException('Admin not found');

    const admin = await this.adminRepository.update(id, dto);

    return plainToInstance(AdminResponseDto, admin, {
      excludeExtraneousValues: true,
    });
  }

  async deleteAdmin(id: string) {
    const existing = await this.adminRepository.findById(id);
    if (!existing) throw new NotFoundException('Admin not found');
    await this.adminRepository.softDelete(id);
    return { message: 'Admin deleted successfully' };
  }

  async assignPagePermission(adminId: string, dto: AssignPagePermissionDto) {
    const admin = await this.adminRepository.findById(adminId);
    if (!admin) throw new NotFoundException('Admin not found');
    if (admin.role === AdminRoles.SUPER_ADMIN) {
      throw new ConflictException('Super admin already has all permissions');
    }

    const permission = await this.adminRepository.upsertPermission({
      adminId,
      pageId: dto.pageId,
      read: dto.read,
      write: dto.write,
      update: dto.update,
      delete: dto.delete,
    });

    return permission;
  }

  async removePagePermission(adminId: string, dto: RemovePagePermissionDto) {
    const admin = await this.adminRepository.findById(adminId);
    if (!admin) throw new NotFoundException('Admin not found');

    const existing = await this.adminRepository.findPermissions(adminId);
    const hasPermission = existing.find((p) => p.pageId === dto.pageId);
    if (!hasPermission) throw new NotFoundException('Permission not found');

    await this.adminRepository.removePermission(adminId, dto.pageId);
    return { message: 'Permission removed successfully' };
  }

  async getAdminPermissions(adminId: string) {
    console.log('controller hit');

    const admin = await this.adminRepository.findById(adminId);
    if (!admin) throw new NotFoundException('Admin not found');
    return this.adminRepository.findPermissions(adminId);
  }
  async findAllPagesWithAdminPermissions(user): Promise<PageWithPermissions[]> {
    const [pages, adminPermissions] = await Promise.all([
      this.pageService.findAllPages({ all: true }),
      this.adminRepository.findPermissions(user.id),
    ]);

    return pages?.data?.map((page) => {
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
  }
}

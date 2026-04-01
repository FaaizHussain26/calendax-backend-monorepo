// src/modules/admin/admin.service.ts
import {
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
  CreateAdminDto,
  UpdateAdminDto,
} from './admin.dto';
import { JwtHelper } from '../../common/jwt/jwt.provider';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly jwtHelper: JwtHelper,
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
      const adminPermissions = await this.adminRepository.findPermissions(
        admin.id,
      );
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
      role: dto.role ?? AdminRoles.ADMIN,  // ✅ default to ADMIN
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
}
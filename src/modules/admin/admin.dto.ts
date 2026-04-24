// src/modules/admin/admin.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { AdminRoles } from '@libs/common/enums/admin.enum';

export class AdminLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsEnum(AdminRoles)
  @IsOptional()
  role?: AdminRoles; // ✅ defaults to ADMIN if not provided

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateAdminDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(AdminRoles)
  @IsOptional()
  role?: AdminRoles;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
  // ✅ password removed — use dedicated change-password endpoint
}

export class AdminResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  role: AdminRoles;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class AssignPagePermissionDto {
  @IsUUID()
  pageId: string;

  @IsBoolean()
  @IsOptional()
  read?: boolean = false;

  @IsBoolean()
  @IsOptional()
  write?: boolean = false;

  @IsBoolean()
  @IsOptional()
  update?: boolean = false;

  @IsBoolean()
  @IsOptional()
  delete?: boolean = false;
}

export class RemovePagePermissionDto {
  @IsUUID()
  pageId: string;
}

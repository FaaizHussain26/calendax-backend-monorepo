// src/modules/tenant-modules/rbac/role/role.dto.ts
import { IsArray, IsBoolean, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @Length(2, 50)
  name: string;

  @IsString()
  @IsOptional()
  @Length(0, 160)
  description?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  permissionIds?: string[]; // assign permissions on creation
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  @Length(2, 50)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(0, 160)
  description?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  permissionIds?: string[];
}

export class AssignPermissionsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}

// src/modules/tenant-modules/rbac/permission-group/permission-group.dto.ts
import { IsOptional, IsString, Length } from 'class-validator';

export class CreatePermissionGroupDto {
  @IsString()
  @Length(2, 60)
  name: string;

  @IsString()
  @IsOptional()
  @Length(0, 160)
  description?: string;
}

export class UpdatePermissionGroupDto {
  @IsString()
  @IsOptional()
  @Length(2, 60)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(0, 160)
  description?: string;
}
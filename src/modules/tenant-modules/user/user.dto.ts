// src/modules/tenant-modules/user/user.dto.ts
import { IsArray, IsBoolean, IsEmail, IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { TenantUserRoles } from '@libs/common/enums/tenant.enum';
import { PaginationDto } from '@libs/common/dto/pagination.dto';

export class CreateUserDto {
  @IsString()
  @Length(2, 75)
  firstName: string;

  @IsString()
  @Length(2, 75)
  @IsOptional()
  middleName?: string;

  @IsString()
  @Length(2, 75)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEnum(TenantUserRoles)
  userType: TenantUserRoles;

  @IsUUID()
  @IsOptional()
  roleId?: string;

  @IsUUID('4', { each: true })
  @IsOptional()
  permissionIds?: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  siteIds?: string[];

  @IsBoolean()
  @IsOptional()
  sendWelcomeEmail?: boolean;
}

export class UpdateUserDto {
  @IsString()
  @Length(2, 75)
  @IsOptional()
  firstName?: string;

  @IsString()
  @Length(2, 75)
  @IsOptional()
  middleName?: string;

  @IsString()
  @Length(2, 75)
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEnum(TenantUserRoles)
  @IsOptional()
  userType?: TenantUserRoles;

  @IsUUID()
  @IsOptional()
  roleId?: string;

  @IsUUID('4', { each: true })
  @IsOptional()
  permissionIds?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UserQueryDto  extends PaginationDto{
  @IsEnum(TenantUserRoles)
  @IsOptional()
  userType?: TenantUserRoles;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

}

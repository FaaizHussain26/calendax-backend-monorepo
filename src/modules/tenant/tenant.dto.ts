import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Length, MinLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { TenantStatus } from '../../enums/tenant.enum';

export class TenantResponseDto {
  id!: string;
  name!: string;
  creadtedById?: string;
  updatedById?: string;
}

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsEmail()
  adminEmail: string;

  @IsString()
  @IsOptional()
  @Length(2, 75)
  adminFirstName?: string;

  @IsString()
  @IsOptional()
  @Length(2, 75)
  adminLastName?: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  adminPassword?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  permissionGroupIds?: string[];
}

export class findTenantDto extends PaginationDto {
  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;
}
export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  permissionGroupIds?: string[];
}

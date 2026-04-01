import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MinLength,
} from 'class-validator';

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

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  name?: string;
}

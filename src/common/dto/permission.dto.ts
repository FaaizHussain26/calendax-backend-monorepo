import { IsOptional, IsString, Length } from 'class-validator';

export class CreatePermissionGroupDto {
  @IsString()
  @Length(2, 60)
  name: string;
               // 'appointments' — used to generate keys
 @IsString()
  @IsOptional()
  @Length(0, 255)
  href?: string; 
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
  @Length(0, 255)
  href?: string; 
  @IsString()
  @IsOptional()
  @Length(0, 160)
  description?: string;
}

export class CreatePermissionDto {
  @IsString()
  @Length(2, 60)
  key: string;                     // 'appointments.approve'

  @IsString()
  @Length(2, 60)
  name: string;                    // 'Approve Appointments'

  @IsString()
  @IsOptional()
  @Length(0, 160)
  description?: string;
}
export class UpdatePermissionDto {
  @IsString()
  @IsOptional()
  @Length(2, 60)
  key?: string;

  @IsString()
  @IsOptional()
  @Length(2, 60)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(0, 160)
  description?: string;
}
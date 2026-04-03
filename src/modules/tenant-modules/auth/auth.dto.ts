import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { TenantUserRoles } from '../../../enums/tenant.enum';
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
export class AdminCreateUserDto {
  @IsString()
  @Length(2, 75)
  firstName: string;

  @IsOptional()
  @IsString()
  @Length(2, 75)
  middleName?: string;

  @IsString()
  @Length(2, 75)
  lastName: string;

  @IsEmail()
  email: string;

  @IsEnum(TenantUserRoles)
  userType: TenantUserRoles;

  @IsUUID()
  @IsOptional()
  roleId?: string; // optional — can assign later

  @IsUUID('4', { each: true })
  @IsOptional()
  permissionIds?: string[];

  @IsBoolean()
  @IsOptional()
  sendWelcomeEmail?: boolean; // if true — system generates password and emails it
}

// User self registering
export class SelfRegisterDto {
  @IsString()
  @Length(2, 75)
  firstName: string;

  @IsOptional()
  @IsString()
  @Length(2, 75)
  middleName?: string;

  @IsString()
  @Length(2, 75)
  lastName: string;

  @IsEnum(TenantUserRoles)
  userType: TenantUserRoles;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Password must contain uppercase, lowercase, number and special character',
    },
  )
  password: string;

  @IsString()
  confirmPassword: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
 
  @IsUUID()
  verificationId: string;
  @IsString()

  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Password must contain uppercase, lowercase, number and special character',
    },
  )
  newPassword: string;

  @IsString()
  confirmPassword: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Password must contain uppercase, lowercase, number and special character',
    },
  )
  newPassword: string;

  @IsString()
  confirmPassword: string;
}

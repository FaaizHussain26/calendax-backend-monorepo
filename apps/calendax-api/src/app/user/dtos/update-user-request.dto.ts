import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Email } from "../../utils/value-objects/email.vo";
import { UserStatus } from "../../utils/value-objects/user-status.vo";
import type { PlainPassword } from "../../utils/value-objects/password.vo";

export class UpdateUserRequestDto {
  @ApiProperty()
  @IsOptional()
  @MaxLength(75)
  @IsString()
  firstName?: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(100)
  @IsString()
  middleName?: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(75)
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: "The email address of the user",
    example: "afham@gmail.com",
  })
  @IsOptional()
  @IsEmail()
  email?: Email;

  @ApiProperty({
    description: "The date and time when the email was verified",
    example: "2024-01-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  emailVerifiedAt?: Date;

  @ApiProperty({
    description: "The date and time when the password expires",
    example: "2024-01-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  passwordExpiresAt?: Date;

  @ApiProperty({
    description: "The primary phone number of the user",
    example: "+1-516-316-4146",
  })
  @IsOptional()
  @Matches(/^\+1-\d{3}-\d{3}-\d{4}$/, {
    message: "Phone number must be in the format +1-516-316-4146",
  })
  phoneNumber1?: string;

  @ApiProperty({
    description: "Is user PrincipalInspector",
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrincipalInvestigator?: boolean;
  
  @IsOptional()
  phoneNumber2?: string;

  @IsOptional()
  @IsInt()
  failedAttempts?: number;

  @IsOptional()
  password?: PlainPassword;

  @IsOptional()
  @IsBoolean()
  isPasswordReset?: boolean;

  @IsOptional()
  @IsBoolean()
  isNotificationEnabled?: boolean;

  @IsOptional()
  @IsDateString()
  lastFailedAttempt?: Date;

  @IsOptional()
  @IsDateString()
  lockedUntil?: Date;

  @IsOptional()
  @IsBoolean()
  isPatient?: boolean;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  isSuperUser?: boolean;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  permissions?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  roles?: number[];
}

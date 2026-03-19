import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserStatus } from "../../utils/value-objects/user-status.vo";
import { Email } from "../../utils/value-objects/email.vo";
import type { PlainPassword } from "../../utils/value-objects/password.vo";

// const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
export class CreateUserRequestDto {
  @ApiProperty({
    description: "The first name of the user",
    maxLength: 75,
    example: "Afham",
  })
  @IsNotEmpty()
  @MaxLength(75)
  @IsString()
  firstName: string;

  @IsOptional()
  @MaxLength(100)
  @IsString()
  middleName?: string;

  @ApiProperty({
    description: "The last name of the user",
    maxLength: 75,
    example: "Ahmed",
  })
  @IsNotEmpty()
  @MaxLength(75)
  @IsString()
  lastName: string;

  @ApiProperty({
    description: "The email address of the user",
    example: "afham@gmail.com",
  })
  @IsNotEmpty()
  @IsEmail()
  email: Email;

  @ApiProperty({
    description: "Is user PI",
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrincipalInvestigator: boolean;

  @IsDateString()
  @IsOptional()
  emailVerifiedAt?: Date;

  @IsOptional()
  password: PlainPassword;

  @IsOptional()
  @IsDateString()
  passwordExpiresAt: Date;

  @ApiProperty({
    description: "The primary phone number of the user",
    example: "+1-516-316-4146",
  })
  @IsNotEmpty()
  @Matches(/^\+1-\d{3}-\d{3}-\d{4}$/, {
    message: "Phone number must be in the format +1-516-316-4146",
  })
  phoneNumber1: string;

  @IsOptional()
  @Matches(/^\+1-\d{3}-\d{3}-\d{4}$/, {
    message: "Phone number must be in the format +1-516-316-4146",
  })
  phoneNumber2: string;

  @IsOptional()
  @IsInt()
  failedAttempts?: number;

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
  isPatient: boolean;

  @IsOptional()
  @IsBoolean()
  isAdmin: boolean;

  @IsOptional()
  @IsBoolean()
  isSuperUser: boolean;

  @ApiPropertyOptional({ description: 'The current status of the user (optional)', enum: UserStatus, required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status: UserStatus;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  permissions: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  roles: number[];
}

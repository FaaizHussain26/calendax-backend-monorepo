// auth/otp/dto/send-otp.dto.ts
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { OtpPurpose } from '../../../../common/enums/system.enum';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  email: string; // email or phone

  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;
}
export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(4, 6)
  code: string;

  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;
}

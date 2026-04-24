import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PartialType, OmitType } from '@nestjs/mapped-types';

export class CreatePatientDto {
  @IsUUID()
  leadId: string;

  @IsUUID()
  siteId: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsOptional()
  email: string ;

  @IsDateString()
  @IsOptional()
  dob: string ;
}

export class UpdatePatientDto extends PartialType(
  OmitType(CreatePatientDto, ['leadId'] as const),
) {}

export class PrefilledPatientDto {
  leadId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  dob: string | null;
}

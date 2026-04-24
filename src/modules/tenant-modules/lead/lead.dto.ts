import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { LeadSource, LeadStatus } from '@libs/common/enums/lead.enum';
import { PaginationDto } from '@libs/common/dto/pagination.dto';

export class CreateLeadDto {
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
  email: string;

  @IsDateString()
  @IsOptional()
  dob: string;

  @IsString()
  @IsOptional()
  bestTimeToCall: string;

  @IsUUID()
  protocolId: string;

  @IsUUID()
  @IsOptional()
  callingConfigId: string;

  @IsUUID()
  @IsOptional()
  siteId: string;
}

export class UpdateLeadDto extends PartialType(CreateLeadDto) {}

export class UpdateLeadStatusDto {
  @IsEnum(LeadStatus)
  status: LeadStatus;
}

export class CreateLeadFromFacebookDto {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  facebookFormId: string;
  protocolId: string;
  callingConfigId: string;
}

export class BulkCreateLeadDto {
  leads: CreateLeadDto[];
}
export class LeadQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;
 
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;
 
  @IsOptional()
  @IsUUID()
  protocolId?: string;
 
  @IsOptional()
  @IsUUID()
  siteId?: string;
 
  @IsOptional()
  @IsUUID()
  callingConfigId?: string;
}
 
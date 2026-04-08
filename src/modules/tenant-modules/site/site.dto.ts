// dto/create-site.dto.ts
import { IsString, IsOptional, IsEmail, IsArray, IsUUID, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateSiteDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  prefix: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  siteNumber?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsNumber()
  @IsOptional()
  patientCount?: number;

  @IsString()
  @IsOptional()
  streetAddress?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  indicationId: string;
}
export class UpdateSiteDto extends PartialType(CreateSiteDto) {}

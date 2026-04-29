import {
  IsString,
  IsEmail,
  IsArray,
  IsNotEmpty,
  ValidateNested,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import {DayOfWeek} from '../../../common/enums/tenant.enum'
import { PartialType } from '@nestjs/mapped-types';
export class WorkingHoursDto {
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;
}

export class CreateBusinessConfigDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsEmail()
  @IsNotEmpty()
  companyEmail: string;

  @ValidateNested()
  @Type(() => WorkingHoursDto)
  workingHours: WorkingHoursDto;

 @IsArray()
@IsEnum(DayOfWeek, { each: true })
workingDays: DayOfWeek[];

  @IsString()
  @IsNotEmpty()
  timezone: string;
}

export class UpdateBusinessConfigDto extends PartialType(CreateBusinessConfigDto) {}

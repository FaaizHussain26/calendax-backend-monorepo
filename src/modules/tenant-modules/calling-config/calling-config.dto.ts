import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { DayOfWeek } from '../../../common/enums/tenant.enum';

export class CallTimeWindowDto {
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;
}

export class CreateCallingConfigDto {
  @IsUUID()
  protocolId: string;

  @IsBoolean()
  isDefault: boolean;

  @ValidateNested()
  @Type(() => CallTimeWindowDto)
  callTimeWindow: CallTimeWindowDto;

  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  selectedDays: DayOfWeek[];

  @IsInt()
  @Min(1)
  numOfCalls: number;

  @IsInt()
  @Min(0)
  maxRetries: number;

  @IsInt()
  @Min(1)
  callDelay: number;
}

export class UpdateCallingConfigDto extends PartialType(CreateCallingConfigDto) {}
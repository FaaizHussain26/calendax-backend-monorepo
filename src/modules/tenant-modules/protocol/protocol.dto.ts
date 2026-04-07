// protocol.dto.ts
import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProtocolDto {
  @IsString()
  name: string;

  @IsString()
  protocolNumber: string;

  @IsUUID()
  @IsOptional()
  indicationId?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  siteIds?: string[];
}

export class UpdateProtocolDto extends PartialType(CreateProtocolDto) {}
// protocol.dto.ts
import { IsString, IsOptional, IsArray, IsUUID, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ProtocolStatus } from '../../../common/enums/protocol.enum';
import { TenantStatus } from '../../../common/enums/tenant.enum';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Transform } from 'class-transformer';

export class CreateProtocolDto {
  @IsString()
  name: string;

  @IsString()
  protocolNumber: string;

  @IsOptional()
  @IsEnum(TenantStatus)
  status?: ProtocolStatus;

  @IsUUID()
  @IsOptional()
  indicationId?: string;
@Transform(({ value }) => (typeof value === 'string' ? [value] : value)) 
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  siteIds?: string[];
}

export class UpdateProtocolDto extends PartialType(CreateProtocolDto) {}
export class ListAllProtocolQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ProtocolStatus)
  status?: ProtocolStatus;
}
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class ConnectFormDto {
  @IsString()
  @IsNotEmpty()
  formId: string;

  @IsString()
  @IsNotEmpty()
  formName: string;

  @IsString()
  @IsNotEmpty()
  pageId: string;

  @IsString()
  @IsNotEmpty()
  pageName: string;

  @IsUUID()
  @IsNotEmpty()
  protocolId: string;

  @IsUUID()
  @IsNotEmpty()
  callingConfigId: string ;
}

export class UpdateFormConnectionDto extends PartialType(ConnectFormDto) {}

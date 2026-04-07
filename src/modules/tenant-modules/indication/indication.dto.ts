import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';

export class CreateIndicationDto {
  @IsString()
  name: string;
}
export class UpdateIndicationDto extends PartialType(CreateIndicationDto) {}


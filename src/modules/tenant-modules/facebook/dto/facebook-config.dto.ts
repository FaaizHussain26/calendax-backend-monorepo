import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateFacebookConfigDto {
  @IsString()
  @IsNotEmpty()
  appId: string;

  @IsString()
  @IsNotEmpty()
  appSecret: string;
}

export class UpdateFacebookConfigDto extends PartialType(CreateFacebookConfigDto) {}

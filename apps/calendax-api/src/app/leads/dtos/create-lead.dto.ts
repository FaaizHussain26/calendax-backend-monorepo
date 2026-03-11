import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class CreateLeadDto {
  @ApiProperty({
    description: 'Lead Platform',
    example: 'Facebook',
    required: true,
  })
  @IsString()
  platform: string;

  @ApiProperty({
    description: 'Lead Link',
    example: 'dummt.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiProperty({
    description: 'Lead Site Id',
    example: '1',
    required: true,
  })
  @IsString()
  site_id?: string;

  @ApiProperty({
    description: 'Lead Study Id',
    example: '1',
    required: true,
  })
  @IsString()
  study_id?: number;

  @ApiProperty({
    description: 'Lead Name',
    example: 'John Doe',
    required: true,
  })
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Lead Phone',
    example: '1234567890',
    required: true,
  })
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Lead Email',
    example: 'john.doe@example.com',
    required: true,
  })
  @IsString()
  @IsEmail()
  email?: string;
}

import { IsString, IsEmail, IsOptional, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOutsideLeadDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional()
    @IsObject()
    @IsOptional()
    payload?: any;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isLinked?: boolean;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    source?: string;
}
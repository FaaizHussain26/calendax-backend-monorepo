import { IsString, IsEmail, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOutSideLeadDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional()
    @IsEmail()
    @IsOptional()
    email?: string;

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
}
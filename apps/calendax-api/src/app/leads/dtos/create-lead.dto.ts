import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { BaseOrmEntity } from '../../utils/entities/base.orm-entity';

export class CreateLeadDto extends BaseOrmEntity {
    @ApiPropertyOptional({
        description: 'Lead Platform Link',
        example: 'https://facebook.com/page',
    })
    @IsString()
    @IsOptional()
    link?: string;

    @ApiPropertyOptional({
        description: 'Facebook Page ID',
        example: '123456789',
    })
    @IsString()
    @IsOptional()
    pageId?: string;

    @ApiPropertyOptional({
        description: 'Facebook Form ID',
        example: '987654321',
    })
    @IsString()
    @IsOptional()
    formId?: string;

    @ApiPropertyOptional({
        description: 'Facebook Page Name',
        example: 'My Facebook Page',
    })
    @IsString()
    @IsOptional()
    pageName?: string;
}
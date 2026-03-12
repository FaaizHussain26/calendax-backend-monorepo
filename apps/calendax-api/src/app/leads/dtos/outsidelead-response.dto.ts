import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OutsideLeadResponseDto {
    @Expose()
    @ApiProperty()
    id: string;

    @Expose()
    @ApiProperty()
    name: string;

    @Expose()
    @ApiProperty()
    email: string;

    @Expose()
    @ApiPropertyOptional()
    phone?: string;

    @Expose()
    @ApiProperty()
    source: string;

    @Expose()
    @ApiPropertyOptional()
    payload?: any;

    @Expose()
    @ApiProperty()
    isLinked: boolean;

    @Expose()
    @ApiPropertyOptional()
    patient?: any;

    @Expose()
    @ApiProperty()
    createdAt: Date;

    @Expose()
    @ApiProperty()
    updatedAt: Date;

    @Expose()
    @ApiPropertyOptional()
    deletedAt?: Date;
}
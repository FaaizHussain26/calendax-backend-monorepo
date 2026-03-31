import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class PageResponseDto {
    id: string;
    name: string;
    slug: string;
    creadtedById?: string;
    updatedById?: string;
}

export class CreatePageDto {
    @ApiProperty({
        name: 'name',
        type: 'string',
        default: 'About Us'
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        name: 'slug',
        type: 'string',
        default: '/about'
    })
    @IsNotEmpty()
    @IsNotEmpty()
    slug: string;
}

export class UpdatePageDto {
    @ApiProperty({
        name: 'name',
        type: 'string'
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        name: 'slug',
        type: 'string'
    })
    @IsNotEmpty()
    @IsOptional()
    slug?: string;
}
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class TenantResponseDto {
    id!: string;
    name!: string;
    creadtedById?: string;
    updatedById?: string;
}

export class CreateTenantDto {
    @ApiProperty({
        name: 'name',
        type: 'string',
        default: 'example.com'
    })
    @IsString()
    @IsNotEmpty()
    name: string;

}

export class UpdateTenantDto {
    @ApiProperty({
        name: 'name',
        type: 'string'
    })
    @IsString()
    @IsOptional()
    name?: string;

}
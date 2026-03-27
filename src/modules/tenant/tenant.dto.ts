import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class TenantResponseDto {
    id: string;
    name: string;
    slug: string;
    creadtedById?: string;
    updatedById?: string;
}

export class CreateTenantDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsNotEmpty()
    slug: string;
}

export class UpdateTenantDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsNotEmpty()
    @IsOptional()
    slug?: string;
}
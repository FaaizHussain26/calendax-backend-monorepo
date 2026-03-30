import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class TenantResponseDto {
    id!: string;
    name!: string;
    creadtedById?: string;
    updatedById?: string;
}

export class CreateTenantDto {
    @IsString()
    @IsNotEmpty()
    name: string;

}

export class UpdateTenantDto {
    @IsString()
    @IsOptional()
    name?: string;

}
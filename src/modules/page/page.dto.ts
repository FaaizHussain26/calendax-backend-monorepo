import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class PageResponseDto {
    id: string;
    name: string;
    slug: string;
    creadtedById?: string;
    updatedById?: string;
}

export class CreatePageDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsNotEmpty()
    slug: string;
}

export class UpdatePageDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsNotEmpty()
    @IsOptional()
    slug?: string;
}
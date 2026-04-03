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
   @IsString()
    @IsOptional()
    href?: string;
}

export class UpdatePageDto {
    @IsString()
    @IsOptional()
    name?: string;
    @IsString()
    @IsOptional()
    href?: string;

}
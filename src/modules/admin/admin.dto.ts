import { Exclude, Expose } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { AdminRoles } from "../../enums/admin.enum";
import { ApiProperty } from "@nestjs/swagger";

export class AdminLoginDto {
    @ApiProperty({
        name: 'email',
        type: 'string',
        default: 'admin@example.com'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        name: 'password',
        type: 'string',
    })
    @IsNotEmpty()
    @IsString()
    password: string;
}

export class CreateAdminDto {
    @ApiProperty({
        name: 'name',
        type: 'string',
        default: 'John Doe'
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        name: 'email',
        type: 'string',
        default: 'admin@example.com'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        name: 'password',
        type: 'string',
    })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        name: 'isActive',
        type: 'boolean',
        default: 'true'
    })
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateAdminDto {
    @ApiProperty({
        name: 'name',
        type: 'string',
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        name: 'email',
        type: 'string'
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({
        name: 'password',
        type: 'string',
    })
    @IsOptional()
    @IsString()
    password?: string;

    @ApiProperty({
        name: 'isActive',
        type: 'boolean'
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class AdminResponseDto {
    @Expose()
    id: string;
    @Expose()
    name: string;
    @Expose()
    email:string;
    @Exclude()
    password: string;
    @Expose()
    role: AdminRoles;
    @Expose()
    isActive: boolean;
    @Expose()
    createdAt: Date;
    @Expose()
    updatedAt: Date;
}
import { IsEmail, IsEnum, IsNotEmpty } from "class-validator";
import { OtpPurpose } from "../database/otp.entity";
import { ApiProperty } from "@nestjs/swagger";

export class SendOtpDto {
    @ApiProperty({
        name: 'email',
        example: 'user@mail.com',
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    
    @ApiProperty({
        description: 'Otp type',
        example: 'verification'
    })
    @IsEnum(OtpPurpose)
    purpose: OtpPurpose;
}
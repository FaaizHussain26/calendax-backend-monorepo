import { IsEmail, IsEnum, IsString, Length } from "class-validator";
import { OtpPurpose } from "../database/otp.entity";
import { ApiProperty } from "@nestjs/swagger";

export class VerifyOtpDto {
    @ApiProperty({
        description: "User's email",
        example: 'user@mail.com'
    })
    @IsEmail()
    email: string;


    @ApiProperty({
        description:'Otp code',
        example: '123456',
    })
    @IsString()
    @Length(6,6)
    code: string;

    @ApiProperty({
        description: 'Otp type',
        example: 'verification'
    })
    @IsEnum(OtpPurpose)
    purpose: OtpPurpose;

}
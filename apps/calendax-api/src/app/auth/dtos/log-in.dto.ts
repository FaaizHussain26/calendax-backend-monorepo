import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";
import type { PlainPassword } from "../../utils/value-objects/password.vo";

export class logInDto {
    @ApiProperty({
        description: "User's email",
        example: "user@example.com"
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;


    @ApiProperty({
        description: "User's Password",
        example: "Password123"
    })
    @IsNotEmpty()
    password: PlainPassword;  
}
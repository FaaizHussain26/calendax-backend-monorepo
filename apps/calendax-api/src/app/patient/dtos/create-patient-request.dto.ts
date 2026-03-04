import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
    ValidateNested } from "class-validator";
import { CreateUserRequestDto } from "../../user/dtos/create-user-request.dto";
import { Type } from "class-transformer";
import { BestTimeToCallEnum } from "../../utils/value-objects/patient-status.enum";

export class CreatePatientRequestDto {
    @IsOptional()
    @IsInt()
    id?: number;

    @ApiPropertyOptional({
        description: "Date of birth of the patient",
        type: String,
        format: "date-time",
        example: "1990-01-01T00:00:00Z"
    })
    @IsOptional()
    @IsString()
    dob?: string;

    @ApiPropertyOptional({
        description: "Additional notes about the patient",
        type: String,
        example: "Patient has a history of allergies to penicillin"
    })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({
        description: "Address of the patient",
        type: String,
        example: "123 Main Street, Apart 4B",
        required: true
    })
    @IsNotEmpty()
    @IsString()
    address: string;

    @ApiPropertyOptional({
        description: "SMS verification code",
        type: String,
        example: "123456",
    })
    @IsOptional()
    @IsString()
    smsCode?: string;

    @ApiPropertyOptional({
        description: "Street address of the patient",
        type: String,
        example: "123 Main Street",
    })
    @IsOptional()
    @IsString()
    streetAddress?: string;

    @ApiPropertyOptional({
        description: "Apartment number of the patient",
        type: String,
        example: "4B"
    })
    @IsOptional()
    @IsString()
    apartmentNumber?: string;

    @ApiPropertyOptional({
        description: "State of residence of the patient",
        type: String,
        example: "California"
    })
    state?: string;

    @ApiPropertyOptional({
        description: "City of residence of the patient",
        type: String,
        example: "Los Angeles"
    })
    city?: string;

    @ApiPropertyOptional({
        description: "Zip code of the patient's address",
        type: String,
        example: "90001"
    })
    @IsOptional()
    @IsString()
    zipCode?: string;

    @ApiPropertyOptional({
        description: "Age of the patient (minimum 18)",
        type: Number,
        example: 25
    })
    @IsOptional()
    @IsInt()
    @Min(18)
    age?: number;

    @ApiProperty({
    type: CreateUserRequestDto,
    description: "user to be created",
    })
    @ValidateNested()
    @Type(() => CreateUserRequestDto)
    @IsNotEmpty()
    user: CreateUserRequestDto;

    @ApiPropertyOptional({
        description: "Indicates if the patient is active",
        type: Boolean,
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({
        description: "Indication of the patient",
        type: String,
        example: "cardiology",
    })
    @IsOptional()
    @IsString()
    indication?: string;

    @ApiProperty({
        description: "Source from where the patient came",
        type: String,
        example: "interest-form",
    })
    @IsOptional()
    @IsString()
    source?: string;

    @ApiPropertyOptional({
        description: "Best time to call the patient",
        type: String,
        enum: ["morning", "afternoon", "evening"],
    })
    @IsOptional()
    @IsString()
    bestTimeToCall?: BestTimeToCallEnum;

}
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsNotEmpty,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { AppointmentStatus } from "../../utils/value-objects/appointment-status.vo";
import { CreatePatientRequestDto } from "../../patient/dtos/create-patient-request.dto";

export class CreatePatientAppointmentDto {
  @ApiProperty({
    description: "The patient associated with the appointment",
    type: CreatePatientRequestDto,
  })
  @ValidateNested()
  @Type(() => CreatePatientRequestDto)
  @IsNotEmpty()
  patient: CreatePatientRequestDto;

  @ApiPropertyOptional({
    description: "The appointment date (yyyy-mm-dd)",
    example: "2025-11-10",
  })
  @IsNotEmpty()
  @IsDateString({}, { message: "date must be in ISO format (yyyy-mm-dd)" })
  date: string;

  @ApiPropertyOptional({
    description: "The appointment time (hh:mm:ss)",
    example: "14:30:00",
  })
  @IsNotEmpty()
  @IsString()
  time: string;

  @ApiPropertyOptional({
    description: "The appointment status",
    enum: AppointmentStatus,
    example: AppointmentStatus.Pending,
  })
  @IsNotEmpty()
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;

  @ApiPropertyOptional({
    description: "Protocol identifier for the appointment",
    example: "PROTO-12345",
  })
  @IsNotEmpty()
  @IsString()
  protocol_id: string;

  @ApiPropertyOptional({
    description: "Medical indication or reason for appointment",
    example: "Clinical trial enrollment",
  })
  @IsNotEmpty()
  @IsString()
  indication: string;

  @ApiProperty({
    description: "The site where the appointment will take place",
    example: 1,
  })
  @IsNotEmpty()
  siteId: number;

  @ApiProperty({
    description: "user",
    example: 1,
  })
  @IsOptional()
  userId: number;
}

import { ApiProperty } from "@nestjs/swagger";
import { AppointmentStatus } from "../../utils/value-objects/appointment-status.vo";
import { PatientResponseDto } from "../../patient/dtos/patient-response.dto";
import { SiteResponseDto } from "../../site/dtos/site-response.dto";
import { UserResponseDto } from "../../user/dtos/user-response.dto";
import { Timestamp } from "typeorm";

export class PatientAppointmentResponseDto {
  @ApiProperty({
    example: 1,
    description: "Unique identifier of the patient appointment",
  })
  id: number;

  @ApiProperty({
    type: () => PatientResponseDto,
    description: "Associated patient for this appointment",
  })
  patient: PatientResponseDto;

  @ApiProperty({
    example: "2025-11-10",
    description: "Date of the appointment in yyyy-mm-dd format",
  })
  date: Date;

  @ApiProperty({
    example: "14:30:00",
    description: "Time of the appointment in hh:mm:ss format",
  })
  time: string;

  @ApiProperty({
    example: AppointmentStatus.Pending,
    description: "Status of the appointment",
    enum: AppointmentStatus,
  })
  status: AppointmentStatus;

  @ApiProperty({
    example: "PROTO-12345",
    description: "Protocol ID associated with the appointment",
  })
  protocol_id?: string;

  @ApiProperty({
    example: "Clinical trial participation",
    description: "Indication or reason for the appointment",
  })
  indication?: string;

  @ApiProperty({
    type: () => SiteResponseDto,
    description: "Associated site where the appointment is scheduled",
  })
  siteId: SiteResponseDto;

  @ApiProperty({
    type: () => UserResponseDto,
    description: "User who created or is responsible for the appointment",
  })
  userId: UserResponseDto;

  @ApiProperty({
    example: "2025-11-10T09:00:00Z",
    description: "Timestamp when the appointment record was created",
  })
  createdAt: Timestamp;

  @ApiProperty({
    example: "2025-11-10T10:00:00Z",
    description: "Timestamp when the appointment record was last updated",
  })
  updatedAt: Timestamp;
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PatientStatusResponseDto {
  @ApiProperty({
    description: "Patient Status ID",
    example: 1,
  })
  id: number;

  @ApiPropertyOptional({
    description: "Patient ID",
    example: 1,
  })
  patientId?: number;

  @ApiProperty({
    description: "Status of the patient",
    example: "scheduled",
  })
  status: string;

  @ApiProperty({
    description: "Created at timestamp",
    example: "2024-01-01T00:00:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Updated at timestamp",
    example: "2024-01-01T00:00:00.000Z",
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: "Patient information",
  })
  patient?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
}

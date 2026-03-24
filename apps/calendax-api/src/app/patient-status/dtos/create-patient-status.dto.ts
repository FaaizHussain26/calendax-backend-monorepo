import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class CreatePatientStatusDto {
  @ApiProperty({
    description: "Patient ID",
    example: 1,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  patientId: number;

  @ApiProperty({
    description: "Status of the patient",
    example: "scheduled",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  status: string;
}

import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsNumber } from "class-validator";

export class UpdatePatientStatusDto {
  @ApiPropertyOptional({
    description: "Patient ID",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  patientId?: number;

  @ApiPropertyOptional({
    description: "Status of the patient",
    example: "confirmed",
  })
  @IsOptional()
  @IsString()
  status?: string;
}

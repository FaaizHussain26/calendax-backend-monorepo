import { ApiProperty} from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { PatientStatusEnum } from "../../utils/value-objects/patient-status.enum";


export class UpdatePatientDto {
  @ApiProperty({
    description: "Active status of the patient",
    type: Boolean,
    example: true,
  })
  @IsOptional()
  isActive: boolean;

  @ApiProperty({
    description: "Status of the patient",
    enum: PatientStatusEnum,
    example: PatientStatusEnum.no_response,
  })
  @IsOptional()
  status: PatientStatusEnum;
}

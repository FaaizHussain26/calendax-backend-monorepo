import { PartialType } from "@nestjs/swagger";
import { CreatePatientAppointmentDto } from "./create-patient-appointment.dto";

export class UpdatePatientAppointmentDto extends PartialType(
  CreatePatientAppointmentDto
) {}

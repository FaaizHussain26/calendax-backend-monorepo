import { Injectable } from "@nestjs/common";
import { PatientRepository } from "../repositories/patient.repository";
import { EmailService } from "../../utils/mailers/email.service";
import { UpdatePatientDto } from "../dtos/update-patient-response-status.dto";
import { Patient } from "../database/patient.entity";
import { assertFound } from "../../utils/exceptions/not-found.exception";

@Injectable()
export class UpdatePatientStatusService {
    constructor(
        private readonly patientRepository: PatientRepository,
        private readonly emailService: EmailService,
    ) {}

    async execute(
        id: number, payload: UpdatePatientDto
    ): Promise<Patient> {
        const existingPatient = await this.patientRepository.getById(id);
        assertFound(existingPatient, "Patient");

        existingPatient.isActive = payload.isActive ?? existingPatient.isActive;
        existingPatient.status = payload.status ?? existingPatient.status;

        const updatedPatient = await this.patientRepository.update(
            id,
            existingPatient
        );
        if(updatedPatient.status) {
            await this.emailService.sendDynamicEmail({
                toEmail: existingPatient.user.email,
                subject: "Your Status has been updated",
                data: {
                    recipient_name:
                        existingPatient.user.firstName +
                        " " +
                        existingPatient.user.lastName,
                        profile_url: existingPatient.id.toString()
                },
            });
        }
        return updatedPatient;
    }
}
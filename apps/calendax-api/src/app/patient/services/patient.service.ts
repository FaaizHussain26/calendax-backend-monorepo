import { Injectable } from "@nestjs/common";
import { PatientRepository } from "../repositories/patient.repository";
import { UserExistsException } from "../../utils/exceptions/user-exists.exception";
import { PatientResponseDto } from "../dtos/patient-response.dto";
import { plainToInstance } from "class-transformer";
import { PaginationRequest } from "../../utils/pagination/interfaces";
import { PaginationResponseDto } from "../../utils/pagination/pagination-response.dto";
import { CreatePatientRequestDto } from "../dtos/create-patient-request.dto";
import { UpdatePatientRequestDto } from "../dtos/update-patient-request.dto";
import { UserRepository } from "../../user/repositories/user.repository";
import { UserService } from "../../user/services/user.service";
import { HandleDBError } from "../../utils/commonErrors/handle-db.error";
import { PatientAlreadyExistsException } from "../../utils/exceptions/patient-already-exists.exception";
import { validatePositiveIntegerId } from "../../utils/commonErrors/permission-id.error";
import { BadRequestException } from "../../utils/exceptions/common.exceptions";
import { DataSource } from "typeorm";
import { UpdatePatientDto } from "../dtos/update-patient-response-status.dto";
import { Patient } from "../database/patient.entity";
import { EmailService } from "../../utils/mailers/email.service";
import { patientNotFound, userNotFound } from "../../utils/exceptions/not-found.exception";

@Injectable()
export class PatientService {
    constructor(
        private readonly patientRepository: PatientRepository,
        private readonly userRepository: UserRepository,
        private readonly userService: UserService,
        private readonly DBError: HandleDBError,
        private readonly dataSource: DataSource,
        private readonly emailService: EmailService
    ) {}

    async getPatients(
    pagination: PaginationRequest
    ): Promise<PaginationResponseDto<PatientResponseDto>> {
        const [patients, total] = await this.patientRepository.getPatients(pagination);
        const currentPage = pagination.page || Math.floor(pagination.skip / pagination.limit) + 1;
        const totalPages = Math.ceil(total / pagination.limit);

        return {
            content: patients.map(patient => plainToInstance(PatientResponseDto, patient)),
            currentPage,
            skippedRecords: pagination.skip,
            totalPages,
            hasNext: currentPage < totalPages,
            payloadSize: patients.length,
            totalRecords: total,
        }
    }

    public async getPatientById(id: number): Promise<PatientResponseDto> {
        validatePositiveIntegerId(id, 'Patient ID');
        try {
            const patient = await this.patientRepository.getById(id);
            patientNotFound(patient);
            return plainToInstance(PatientResponseDto, patient);
        }catch(error){throw new BadRequestException(error.message);}
    }

    public async getPatientByUserId(userId: number): Promise<PatientResponseDto> {
        validatePositiveIntegerId(userId, 'User ID');
        try{
            const patient = await this.patientRepository.getByUserId(userId);
            patientNotFound(patient);
            return  plainToInstance(PatientResponseDto, patient);
        }catch(error){throw new BadRequestException(error.message);}
    }

    public async createPatient(patient: CreatePatientRequestDto): Promise<PatientResponseDto> {
        if(!patient || !patient.user) {
            throw new BadRequestException('Inva lid Patient Data');
        }
        try {
            const result = await this.dataSource.transaction(async (manager) => {
            const user = await this.userService.createUser(patient.user, manager);
            const newPatient = await this.patientRepository.create(
                { ...patient, user },
                manager
            );
            return newPatient;
        });
        return plainToInstance(PatientResponseDto, result);
        }catch(error) {
            return this.DBError.handleDBError(error, new PatientAlreadyExistsException(error.message));
        }
    }

    public async updatePatient(id: number, patient: UpdatePatientRequestDto): Promise<PatientResponseDto> {
        validatePositiveIntegerId(id, 'Patient ID');
        let patientEntity = await this.patientRepository.getById(id);
        patientNotFound(patientEntity);
        try {
            await this.userService.updateUser(patientEntity.user?.id, patient.user);
            const updatedUser = await this.userRepository.getById(patientEntity.user?.id);
            patientEntity = await this.patientRepository.update(id, {...patient, user: updatedUser});
            return plainToInstance(PatientResponseDto, patientEntity);
        }catch (error) {
            return this.DBError.handleDBError(error, new UserExistsException(error.message));
        }
    }

    public async updatePatientStatus(
        id: number,
        payload: UpdatePatientDto,
    ): Promise<Patient> {
        validatePositiveIntegerId(id, 'Patient ID');
        const existingPatient = await this.patientRepository.getById(id);
        patientNotFound(existingPatient);
        existingPatient.isActive = payload.isActive ?? existingPatient.isActive;
        existingPatient.status = payload?.status ?? existingPatient.status;

        const updatedPatient = await this.patientRepository.update(
            id,
            existingPatient,
        );
        if(updatedPatient.status) {
            await this.emailService.sendDynamicEmail({
                toEmail: existingPatient.user.email,
                data: {
                    recipient_name:
                    existingPatient.user.firstName +
                    " " +
                    existingPatient.user.lastName,
                    profile_url: existingPatient.id.toString(),
                },
            });
        }
        return updatedPatient;
    }

    public async delete(id: number) {
        validatePositiveIntegerId(id, 'Patient ID');
        const patient = await this.patientRepository.getById(id);
        patientNotFound(patient);
        const user = await this.userService.getUser(patient.user?.id);
        userNotFound(user);
        await this.patientRepository.delete(id);
        await this.userService.deleteUser(user.id);
    } 
}
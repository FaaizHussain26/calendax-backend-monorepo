import { Injectable } from "@nestjs/common";
import { PinoLoggerService } from "../../utils/logger/pinoLogger.service";
import { PatientStatusRepository } from "../repositories/patient-status.repository";
import { PaginationRequest } from "../../utils/pagination/interfaces";
import { PatientStatus } from "../database/patient-status.orm-entity";
import { BadRequestException } from "../../utils/exceptions/common.exceptions";
import { assertFound } from "../../utils/exceptions/not-found.exception";
import { DeepPartial, DeleteResult, UpdateResult } from "typeorm";
import { validatePositiveIntegerId } from "../../utils/commonErrors/permission-id.error";

@Injectable()
export class PatientStatusService {
    constructor(
        private readonly logger: PinoLoggerService,
        private readonly patientStatusRepository: PatientStatusRepository,
    ) {
        this.logger.setContext("Patient Status Service");
    }

    async getAll(
        pagination: PaginationRequest
    ): Promise<[patientsStatuses: PatientStatus[], total: number]> {
        try {
            return await this.patientStatusRepository.getAll(pagination);
        }catch(error) {
            this.logger.error("Error getting all patient statuses", error);
            throw new BadRequestException(error.message);
        }
    }

    async getById(
        id: PatientStatus['id']
    ): Promise<PatientStatus | null> {
        try {
            const patientsStatus = await this.patientStatusRepository.getById(id);
            assertFound(patientsStatus, "Patient Status", id);
            return patientsStatus;
        }catch(error) {
            this.logger.error(`Error getting patient status by ID ${id}`, error);
            throw new BadRequestException(error.message);
        }
    }

    async getByPatientId(
        patientId: number
    ): Promise<PatientStatus | null> {
        try {
            const patientsStatus = await this.patientStatusRepository.getByPatientId(patientId);
            assertFound(patientsStatus, "Patient Status with Patient ID", patientId);
            return patientsStatus;
        }catch(error) {
            this.logger.error(`Error getting patient status by Patient ID ${patientId}`, error);
            throw new BadRequestException(error.message);
        }
    }

    async create(
        patientStatus: DeepPartial<PatientStatus>
    ): Promise<PatientStatus | null> {
        try {
            const exisitingStatus = await this.patientStatusRepository.getByPatientId(
                patientStatus.patientId
            );
            if(exisitingStatus) {
                throw new BadRequestException(
                    `Patient status already exists for patient ID ${patientStatus.patientId}`
                );
            }
            const createdPatientStatus = 
                await this.patientStatusRepository.create(patientStatus);
            this.logger.info(
                `Created patient status for patient ID ${patientStatus.patientId}`
            );
            return createdPatientStatus;
        }catch (error) {
            this.logger.error("Error creating patient status", error);
            throw new BadRequestException(error.message);
        }
    }

    async update(
        id: PatientStatus['id'],
        data: DeepPartial<PatientStatus>
    ): Promise<UpdateResult> {
        try{
            validatePositiveIntegerId(id, "Patient Status ID");
            const exisitingStatus = await this.patientStatusRepository.getById(id);
            assertFound(exisitingStatus, "Patient Status", id);
            const result = await this.patientStatusRepository.update(id, data);
            this.logger.info(
                `Updated patient status with ID ${id}`
            );
            return result;
        }catch(error) {
            this.logger.error(`Error updating patient status with ID ${id}`, error);
            throw new BadRequestException(error.message);
        }
    }

    async delete(
        id: PatientStatus['id']
    ): Promise<DeleteResult> {
        try {
            const exisitingStatus = await this.patientStatusRepository.getById(id);
            assertFound(exisitingStatus, "Patient Status", id);
            const result = this.patientStatusRepository.delete(id);
            this.logger.info(
                `Deleted patient status with ID ${id}`
            );
            return result;
        }catch(error) {
            this.logger.error(`Error deleting patient status with ID ${id}`, error);
            throw new BadRequestException(error.message);
        }
    }
}
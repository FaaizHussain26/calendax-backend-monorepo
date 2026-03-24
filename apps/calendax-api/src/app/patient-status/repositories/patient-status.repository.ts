import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PatientStatus } from "../database/patient-status.orm-entity";
import { DeepPartial, DeleteResult, UpdateResult, Repository } from "typeorm";
import { PaginationService } from "../../utils/pagination/services/pagination.service";
import { PaginationRequest } from "../../utils/pagination/interfaces";

@Injectable()
export class PatientStatusRepository {
    constructor(
        @InjectRepository(PatientStatus)
        private readonly patientStatusRepository: Repository<PatientStatus>,
        private readonly paginationService: PaginationService,
    ) {}

    async getAll(
        pagination: PaginationRequest
    ): Promise<[patientsStatuses: PatientStatus[], total: number]> {
        return await this.paginationService.getPaginatedDataWithCount(
            this.patientStatusRepository,
            ["patient"],
            pagination,
        );
    }

    async getById(
        id: PatientStatus['id']
    ): Promise<PatientStatus | null> {
        return await this.patientStatusRepository.findOne({
            where: { id },
            relations: ['patient'],
        });
    }

    async getByPatientId(
        patientId: number
    ): Promise<PatientStatus | null> {
        return await this.patientStatusRepository.findOne({
            where: { patientId },
            relations: ['patient'],
        });
    }

    async create(
        patientsStatus: DeepPartial<PatientStatus>
    ): Promise<PatientStatus | null> {
        const newPatientsStatus = this.patientStatusRepository.create(patientsStatus);
        return await this.patientStatusRepository.save(newPatientsStatus);
    }

    async update(
        id: PatientStatus['id'],
        data: DeepPartial<PatientStatus>
    ): Promise<UpdateResult> {
        return await this.patientStatusRepository.update(id, data);
    }

    async delete(
        id: PatientStatus['id']
    ): Promise<DeleteResult> {
        return await this.patientStatusRepository.delete(id);
    }
}
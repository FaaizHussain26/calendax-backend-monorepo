import { Injectable } from "@nestjs/common";
import { PaginationRequest } from "../../utils/pagination/interfaces";
import { Patient } from "../database/patient.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, EntityManager, Repository } from "typeorm";
import { DeleteResult } from "typeorm/browser";
import { PaginationService } from "../../utils/pagination/services/pagination.service";

@Injectable()
export class PatientRepository {
    constructor(
            @InjectRepository(Patient) private readonly patientRepository: Repository<Patient>,
            private readonly paginationService: PaginationService,
        ){};


    async getPatients(pagination: PaginationRequest): Promise<[leadPatients: Patient[],totalPatients: number]> {
        const params = pagination.params;
        if(!params.indication) {
            return await this.paginationService.getPaginatedDataWithCount(
                this.patientRepository,
                ['user'],
                pagination
            );
        }

        return await this.paginationService.getPaginatedDataWithCount(
            this.patientRepository,
            ['user'],
            pagination,
        );
    }

    async getById(patientId: Patient['id']): Promise<Patient> {
        const patient = await this.patientRepository.findOne({
            where: {id: patientId},
            relations:['user']

        });

        if(!patient) {
            return null;
        }
        return patient;
    }

    async getByUserId(userId: number): Promise<Patient> {
        return this.patientRepository.findOne({
            where: {
                user: {
                    id: userId,
                },
            },
            relations: ["user"]
        });
    }

    async create(patient: DeepPartial<Patient>,
        manager?: EntityManager,
    ): Promise<Patient> {
        const newPatient = this.patientRepository.create(patient);
        return await this.patientRepository.save(newPatient);
        
    }

    async update(id: Patient['id'], 
        patient: DeepPartial<Patient>): Promise<Patient> {
            await this.patientRepository.update(id, patient);
            return this.patientRepository.findOneBy({id});
    }

    async delete(id: Patient['id']): Promise<DeleteResult> {
        return await this.patientRepository.delete(id);
    }
}
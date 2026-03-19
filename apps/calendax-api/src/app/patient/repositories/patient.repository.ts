import { Injectable } from "@nestjs/common";
import { PaginationRequest } from "../../utils/pagination/interfaces";
import { Patient } from "../database/patient.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, EntityManager, In, Repository } from "typeorm";
import { DeleteResult } from "typeorm/browser";
import { PaginationService } from "../../utils/pagination/services/pagination.service";

@Injectable()
export class PatientRepository {
    constructor(
            @InjectRepository(Patient) private readonly patientRepository: Repository<Patient>,
            private readonly paginationService: PaginationService,
        ){};


    async getPatients(
        pagination: PaginationRequest,
        siteIds?: number[],
        isAdmin?: boolean,
    ): Promise<[leadPatients: Patient[],totalPatients: number]> {
        const params = pagination.params;

        const hasFilters = 
            (!isAdmin && siteIds && siteIds.length > 0) ||
            params.status ||
            params.protocol_id ||
            params.fromDate ||
            params.tillDate;

        if (
            params.fromDate &&
            params.tillDate &&
            params.fromDate > params.tillDate
        ) {
            throw new Error("Invalid date range: fromDate cannot be after tillDate");
        }

        const whereCondition = (qb) => {
            const conditions: string[] = [];
            const parameters: Record<string, any> = {};

            if(!isAdmin && siteIds?.length > 0) {
                qb.leftJoin("entity.user", "user").leftJoin("user.sites", "sites");
                conditions.push("sites.Id IN (:...siteIds");
                parameters.siteIds = siteIds;
            }

            if(params.protocolId) {
                qb.leftJoin("entity.patientSites", "patientSites");
                conditions.push("patientSites.protocolId = :protocolId");
                parameters.protocolId = params.protocolId;
            }

            if(params.status) {
                conditions.push("entity.status = :status");
                parameters.status = params.status;
            }

            const hasFromDate = params.fromDate?.trim();
            const hasTillDate = params.tillDate?.trim();

            if(hasFromDate && hasTillDate) {
                conditions.push("entity.created_at BETWEEN :fromDate AND :tillDate");
                parameters.fromDate = params.fromDate;
                parameters.tillDate = params.tillDate;
            }else if(hasFromDate) {
                conditions.push("entity.created_at >= :fromDate");
                parameters.fromDate = params.fromDate;
            }else if(hasTillDate) {
                conditions.push("entity.created_at <= :tillDate");
                parameters.tillDate = params.tillDate;
            }

            if(conditions.length > 0) {
                qb.where(conditions.join(" AND "), parameters);
            }
        }
        if(hasFilters) {
            return await this.paginationService.getPaginatedDataWithCount(
                this.patientRepository,
                ["user", "leads"],
                pagination,
                whereCondition
            );
        }
        return await this.paginationService.getPaginatedDataWithCount(
            this.patientRepository,
            ["user", "leads"],
            pagination
        )
    }

    async streamAllPatientsForExport(
        params: {
            status?: string;
            protocolId?: string;
            fromDate?: string;
            tillDate?: string;
        },
        siteIds: number[] = [],
        isAdmin: boolean = false,
    ): Promise<NodeJS.ReadableStream> {
        const qb = this.patientRepository
            .createQueryBuilder("entity")
            .leftJoinAndSelect("entity.user", "user")
            .leftJoinAndSelect("entity.leads", "leads");

        const conditions: string[] = [];
        const parameters: Record<string, any> = {};

        if(!isAdmin && siteIds?.length > 0) {
            qb.leftJoin("user.sites", "sites");
            conditions.push("patientSites.protocolId = :protocolId");
            parameters.protocolId = params.protocolId;
        }

        if(params.status) {
            conditions.push("entity.status = :status");
            parameters.status = params.status;
        }
        const hasFromDate = params.fromDate?.trim();
        const hasTillDate = params.tillDate?.trim();

        if (hasFromDate && hasTillDate) {
            conditions.push("entity.created_at BETWEEN :fromDate AND :tillDate");
            parameters.fromDate = params.fromDate;
            parameters.tillDate = params.tillDate;
        } else if (hasFromDate) {
            conditions.push("entity.created_at >= :fromDate");
            parameters.fromDate = params.fromDate;
        } else if (hasTillDate) {
            conditions.push("entity.created_at <= :tillDate");
            parameters.tillDate = params.tillDate;
        }

        if (conditions.length > 0) {
            qb.where(conditions.join(" AND "), parameters);
        }

        qb.orderBy("entity.created_at", "DESC");
        return qb.stream();
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

    async getByIds(
        patientIds: Patient['id'][],
    ): Promise<Patient[]> {
        return await this.patientRepository.find({
            where: {
                id: In(patientIds),
            },
            relations: ["user"],
        });
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

    async getByUserIds(userIds: number[]): Promise<Patient[]> {
        return this.patientRepository.find({
            where: { id: In(userIds) },
            relations: ["user"],
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
import { Injectable } from "@nestjs/common";
import { PaginationService } from "../../utils/pagination/services/pagination.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Lead } from "../database/lead.orm-entity";
import { Repository } from "typeorm";
import { PaginationRequest } from "../../utils/pagination/interfaces";
import { Patient } from "../../patient/database/patient.entity";
import { DeepPartial } from "mongoose";
import { BadRequestException } from "../../utils/exceptions/common.exceptions";
import { DeleteResult } from "typeorm/browser";

@Injectable()
export class OutsideLeadRepository {
    constructor(
        private readonly paginationService: PaginationService,
        @InjectRepository(Lead)
        private readonly leadRepository: Repository<Lead>,
    ) {}

    async getLeads(
        pagination: PaginationRequest
    ): Promise<[leadEntities: Lead[],totalLeads: number]> {
        const params = pagination.params;
        const hasConditions = Boolean(params.eventId);

        const whereCondition = hasConditions
        ? (qb) => {
            const conditions = [];
            const parameters = {};

            if(params.eventId) {
                conditions.push("entity_event.id = :eventId");
                parameters["eventId"] = params.eventId;
            }
            
            if(conditions.length) {
                qb.where(conditions.join(" AND "), parameters);
            }
        }
        : null;
        return await this.paginationService.getPaginatedDataWithCount(
            this.leadRepository,
            ['patients'],
            pagination,
            whereCondition,
        );
    }

    async getById(
        leadId: Lead['id']
    ): Promise<Lead | null> {
        const lead = await this.leadRepository.findOne({
            where: { id: leadId, }
        });
        if(lead === null) {
            return null;
        }
        return lead;
    };

    async getByPatientId(
        patientId: Patient['id'],
    ): Promise<Lead[]> {
        const leads = await this.leadRepository.find({
            where: {
                patient: { id: patientId },
            },
        });
        return leads;
    }

    async create(
        lead: DeepPartial<Lead>
    ): Promise<Lead | null> {
        const newLead = this.leadRepository.create(lead);
        return await this.leadRepository.save(newLead);
    }

    async update(
        id: Lead['id'],
        lead: Lead,
    ): Promise<Lead | null> {
        const existingLead = await this.leadRepository.findOne({ where: { id } });
        if(!existingLead) {
            throw new BadRequestException("Appointment not found");
        }

        await this.leadRepository.update(id, lead);
        return this.leadRepository.findOneBy({ id });
    }

    async delete(
        leadId: Lead['id']
    ): Promise<DeleteResult | null> {
        return await this.leadRepository.delete(leadId);
    }
}
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LeadsPlatform } from "../database/leads-platform.orm-entity";
import { Repository } from "typeorm";
import { PaginationService } from "../../utils/pagination/services/pagination.service";
import { PaginationRequest } from "../../utils/pagination/interfaces";
import { DeepPartial } from "typeorm";
import { DeleteResult } from "typeorm";
import { NotFoundException } from "../../utils/exceptions/common.exceptions";

@Injectable()
export class LeadRepository {
    constructor(
        @InjectRepository(LeadsPlatform)
        private readonly leadRepository: Repository<LeadsPlatform>,
        private readonly paginationService: PaginationService,
    ) {}

    async getLeads(
        pagination: PaginationRequest
    ): Promise<[leadEntities: LeadsPlatform[], totalLeads: number]> {
        return await this.paginationService.getPaginatedDataWithCount(
            this.leadRepository,
            [],
            pagination,
            null
        );
    }

    async getById(
        leadId: LeadsPlatform['id'],
    ): Promise<LeadsPlatform | null> {
        return await this.leadRepository.findOne({
            where: {
                id: leadId,
            },
        });
    }

    async create(
        lead: DeepPartial<LeadsPlatform>
    ): Promise<LeadsPlatform | null> {
        const newLead = this.leadRepository.create(lead);
        return await this.leadRepository.save(newLead);
    }

    async update(
        id: LeadsPlatform['id'],
        lead: LeadsPlatform
    ): Promise<LeadsPlatform | null> {
        const existingLead = await this.leadRepository.findOne({ where: { id } });

        if(!existingLead) {
            throw new NotFoundException("Lead not found");
        }

        await this.leadRepository.update(id, lead);
        return await this.leadRepository.findOneBy({ id });
    }

    async delete(
        leadId: LeadsPlatform['id'],
    ): Promise<DeleteResult | null> {
        const lead = await this.leadRepository.findOneBy({ id: leadId });
        if(!lead) return null;
        const result = await this.leadRepository.delete(leadId);
        result.raw = {
            ...result.raw,
            deleteLead: lead,
        };
        return result;
    }
}
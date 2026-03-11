import { Injectable } from "@nestjs/common";
import { LeadRepository } from "../repositories/lead.repository";
import { LeadsPlatform } from "../database/leads-platform.orm-entity";
import { BadRequestException } from "../../utils/exceptions/common.exceptions";
import { DeepPartial } from "typeorm";
import { DeleteResult } from "typeorm/browser";
import { CreateLeadDto } from "../dtos/create-lead.dto";
import { validatePositiveIntegerId } from "../../utils/commonErrors/permission-id.error";
import { leadNotFound } from "../../utils/exceptions/not-found.exception";

@Injectable()
export class LeadService {
    constructor(
        private readonly leadRepository: LeadRepository,
    ) {}

    async getLeads(
        pagination: any
    ): Promise<[leadEntities: LeadsPlatform[], totalLeads: number]> {
        try {
            return await this.leadRepository.getLeads(pagination);
        }catch(error) {
            throw new BadRequestException(error.message);
        }
    }

    async getLead(
        leadId: LeadsPlatform['id']
    ): Promise<LeadsPlatform> {
        try {
            validatePositiveIntegerId(leadId, 'Lead ID');
            const lead =  await this.leadRepository.getById(leadId);
            leadNotFound(lead);
            return lead;
        }catch(error) {
            throw new BadRequestException(error.message);
        }
    }

    async createLead(
        lead: CreateLeadDto
    ): Promise<LeadsPlatform> {
        try {
            return await this.leadRepository.create(lead);
        }catch(error) {
            throw new BadRequestException(error.message);
        }
    }

    async updateLead(
        leadId: LeadsPlatform['id'],
        data: DeepPartial<LeadsPlatform>
    ): Promise<LeadsPlatform | null> {
        try {
            validatePositiveIntegerId(leadId, 'Lead ID');
            const lead =  await this.leadRepository.getById(leadId);
            leadNotFound(lead);
            return await this.leadRepository.update(leadId, data as LeadsPlatform);
        }catch(error) {
            throw new BadRequestException(error.message);
        }
    }

    async deleteLead(
        leadId: LeadsPlatform['id']
    ): Promise<DeleteResult> {
        try {
            validatePositiveIntegerId(leadId, 'Lead ID');
            const lead =  await this.leadRepository.getById(leadId);
            leadNotFound(lead);
            return await this.leadRepository.delete(leadId);
        }catch(error) {
            throw new  BadRequestException(error.message);
        }
    }
}
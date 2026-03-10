import { Injectable } from "@nestjs/common";
import { LeadRepository } from "../repositories/lead.repository";
import { LeadsPlatform } from "../database/leads-platform.orm-entity";
import { BadRequestException } from "../../utils/exceptions/common.exceptions";
import { DeepPartial } from "typeorm";
import { DeleteResult } from "typeorm/browser";

@Injectable()
export class LeadService {
    constructor(
        private readonly leadRepository: LeadRepository,
    ) {}

    async getLeads(
        pagination: any
    ): Promise<[leadEntities: LeadsPlatform[], totalLeads: number]> {
        return await this.leadRepository.getLeads(pagination);
    }

    async getLead(
        eventId: LeadsPlatform['id']
    ): Promise<LeadsPlatform> {
        try {
            return this.leadRepository.getById(eventId);
        }catch(error) {
            throw new BadRequestException(error.message);
        }
    }

    async createLead(
        lead: LeadsPlatform
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
            return await this.leadRepository.update(leadId, data as LeadsPlatform);
        }catch(error) {
            throw new BadRequestException(error.message);
        }
    }

    async deleteLead(
        leadId: LeadsPlatform['id']
    ): Promise<DeleteResult> {
        try {
            return this.leadRepository.delete(leadId);
        }catch(error) {
            throw new  BadRequestException(error.message);
        }
    }
}
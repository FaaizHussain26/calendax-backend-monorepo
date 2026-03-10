import { Injectable } from "@nestjs/common";
import { Lead } from "../database/lead.orm-entity";
import { BadRequestException } from "../../utils/exceptions/common.exceptions";
import { DeepPartial } from "typeorm";
import { DeleteResult } from "typeorm/browser";
import { OutsideLeadRepository } from "../repositories/outside-lead.repository";

@Injectable()
export class OutSideLeadService {
    constructor(
        private readonly leadRepository: OutsideLeadRepository,
    ) {}

    async getLeads(
        pagination: any
    ): Promise<[leadEntities: Lead[], totalLeads: number]> {
        return await this.leadRepository.getLeads(pagination);
    }

    async getLead(
        eventId: Lead['id']
    ): Promise<Lead> {
        try {
            return this.leadRepository.getById(eventId);
        }catch(error) {
            throw new BadRequestException(error.message);
        }
    }

    async createLead(
        lead: Lead
    ): Promise<Lead> {
        try {
            return await this.leadRepository.create(lead);
        }catch(error) {
            throw new BadRequestException(error.message);
        }
    }

    async updateLead(
        leadId: Lead['id'],
        data: DeepPartial<Lead>
    ): Promise<Lead | null> {
        try {
            return await this.leadRepository.update(leadId, data as Lead);
        }catch(error) {
            throw new BadRequestException(error.message);
        }
    }

    async deleteLead(
        leadId: Lead['id']
    ): Promise<DeleteResult> {
        try {
            return this.leadRepository.delete(leadId);
        }catch(error) {
            throw new  BadRequestException(error.message);
        }
    }
}
import { Injectable } from "@nestjs/common";
import { Lead } from "../database/lead.orm-entity";
import { BadRequestException } from "../../utils/exceptions/common.exceptions";
import { DeepPartial, DeleteResult } from "typeorm";
import { OutsideLeadRepository } from "../repositories/outside-lead.repository";
import { CreateOutsideLeadDto } from "../dtos/create-outside-lead.dto";
import { leadNotFound } from "../../utils/exceptions/not-found.exception";

@Injectable()
export class OutsideLeadService {
    constructor(
        private readonly leadRepository: OutsideLeadRepository,
    ) {}

    async getLeads(
        pagination: any
    ): Promise<[leadEntities: Lead[], totalLeads: number]> {
        try {
            return await this.leadRepository.getLeads(pagination);
        }catch(error) {
            throw new BadRequestException(error.message);
        }
    }

    async getLead(
        eventId: Lead['id']
    ): Promise<Lead> {
        try {
            const lead = await this.leadRepository.getById(eventId);
            leadNotFound(lead);
            return lead;
        }catch(error) {
            throw new BadRequestException(error.message);
        }
    }

    async createLead(
        lead: CreateOutsideLeadDto
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
            const lead = await this.leadRepository.getById(leadId);
            leadNotFound(lead);
            return await this.leadRepository.update(leadId, data as Lead);
        }catch(error) {
            throw new BadRequestException(error.message);
        }
    }

    async deleteLead(
        leadId: Lead['id']
    ): Promise<DeleteResult> {
        try {
            const lead = await this.leadRepository.getById(leadId);
            leadNotFound(lead);
            return await this.leadRepository.delete(leadId);
        }catch(error) {
            throw new  BadRequestException(error.message);
        }
    }
}
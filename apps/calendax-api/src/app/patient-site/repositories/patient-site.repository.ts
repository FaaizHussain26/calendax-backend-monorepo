import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PatientSite } from "../database/patient-site.entity";
import { In, Repository } from "typeorm";

@Injectable()
export class PatientSiteRepository {
    constructor(
        @InjectRepository(PatientSite)
        private readonly repository: Repository<PatientSite>,
    ) {}

    async create(
        patientSite: Partial<PatientSite>
    ): Promise<PatientSite> {
        const entity = this.repository.create(patientSite);
        return await this.repository.save(entity);
    }

    async bulkCreate(
        patientSites: Partial<PatientSite>[]
    ): Promise<PatientSite[]> {
        const entities = this.repository.create(patientSites);
        return await this.repository.save(entities);
    }

    async getAllProtocolIds(): Promise<string[]> {
        const result = await this.repository
        .createQueryBuilder('patientSite')
        .select('DISTINCT patientSite.protocolId', 'protocolId')
        .getRawMany();
        return result.map((row) => row.protocolId);
    }

    async findById(
        id: PatientSite['id']
    ): Promise<PatientSite | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['patient', 'patient.user', 'site'],
        });
    }

    async findByPatientId(
        patientId: number
    ): Promise<PatientSite[]> {
        return await this.repository.find({
            where: { patient: { id: patientId } },
            relations: ['site'],
        });
    }

    async findByPatientIds(
        patientIds: number[]
    ): Promise<PatientSite[]> {
        if(!patientIds?.length) {
            return [];
        }
        return await this.repository.find({
            where: { patient: { id: In(patientIds) } },
            relations: ["patient"],
        });
    }

    async findBySiteId(
        siteId: number
    ): Promise<PatientSite[]> {
        return await this.repository.find({
            where: { site: { id: siteId } },
            relations: ['patient', 'patient.user'],
        });
    }

    async findBySiteAndProtocolId(
        siteId: number,
        protocolId: string,
    ): Promise<PatientSite[]> {
        return await this.repository.find({
            where: {
                site: { id: siteId },
                protocolId,
            },
            relations: ['patient', 'patient.user', 'site'],
        });
    }

    async findByPatientSiteAndProtocolId(
        patientId: number,
        siteId: number | null,
        protocolId: string,
    ): Promise<PatientSite | null> {
        return await this.repository.findOne({
            where: {
                patient: { id: patientId },
                site: { id: siteId },
                protocolId,
            },
            relations: ['patient', 'site'],
        });
    }

    async findByPatientSiteAndProtocolIds(
        patientIds: number[],
        siteIds: number[] | null[],
        protocolIds: string[],
    ): Promise<PatientSite[]> {
        return await this.repository.find({
            where: {
                patient: { id: In(patientIds) },
                site: { id: In(siteIds) },
                protocolId: In(protocolIds),
            },
            relations: ['patient', 'patient.user', 'site'],
        });
    }

    async update(
        id: number,
        patientSite: Partial<PatientSite>,
    ): Promise<PatientSite> {
        await this.repository.update(id, patientSite);
        return await this.findById(id);
    }

    async delete(
        id: number,
    ): Promise<void> {
        await this.repository.delete(id);
    }

    async deleteByPatientSiteAndProtocolId(
        patientId: number,
        siteId: number,
        protocolId: string,
    ): Promise<void> {
        await this.repository.delete({
            patient: { id: patientId },
            site: { id: siteId },
            protocolId,
        });
    }
}
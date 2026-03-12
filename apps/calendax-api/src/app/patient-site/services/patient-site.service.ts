import { BadRequestException, Injectable } from "@nestjs/common";
import { PatientSiteRepository } from "../repositories/patient-site.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { ProtocolsSites } from "../database/protocol-site.entity";
import { Repository } from "typeorm";
import { Connection } from "mongoose";
import { InjectConnection } from "@nestjs/mongoose";
import { PatientRepository } from "../../patient/repositories/patient.repository";


@Injectable()
export class PatientSiteService {
    constructor(
        private readonly patientSiteRepository: PatientSiteRepository,
        private readonly patientRepository: PatientRepository,
        @InjectRepository(ProtocolsSites)
        private readonly protocolSiteRepository: Repository<ProtocolsSites>,
        @InjectConnection() private readonly mongoConnection: Connection
    ) {}

    async getAllProtocols(): Promise<string[]> {
        console.log("Fetching all protocol IDs from patient sites...");
        return await this.patientSiteRepository.getAllProtocolIds();
    }

    async addMongodbDataToPatientSite(
        protocolId: string
    ): Promise<void> {
        const existingProtocolIds = await this.protocolSiteRepository.find({
            where: { protocol_id: protocolId },
        });

        if(!existingProtocolIds || existingProtocolIds.length === 0) {
            throw new BadRequestException(
                `No existing Protocol-site with protocolId: ${protocolId}`
            );
        }

        const patientQuestions = await this.mongoConnection
            .collection("patient-questions")
            .find({ protocol_id: protocolId })
            .toArray();

        if(patientQuestions.length > 0) {
            await Promise.all(
                patientQuestions.map(async (data) => {
                    const patientIdNum = Number(data.patientId);    
                    if(!data.patientId || isNaN(patientIdNum)) {
                        console.log(
                            `Skipping record - missing or invalid patientId: ${data._id}`
                        );
                        return;
                    }
                    
                    const patient = await this.patientRepository.getById(patientIdNum);
                    if(!patient) {
                        console.log(
                            `Patient not found for id: ${data.patientId}, skipping...`
                        );
                        return;
                    }

                    const patientSite = 
                        await this.patientSiteRepository.findByPatientSiteAndProtocolId(
                            patientIdNum,
                            null,
                            data.protocol_id,
                        );

                    if(!patientSite) {
                        await this.patientSiteRepository.create({
                            patient,
                            protocolId: data.protocol_id,
                            site: null,
                        });
                        console.log(`Created PatientSite for patient: ${data.patientId}`);
                    } else{
                        console.log(
                            `PatientSite already exists for patient: ${data.patientId}, skipping...`
                        );
                    }

                }),
            );
        }
    }
}
import { Module } from "@nestjs/common";
import { PatientSiteRepository } from "./repositories/patient-site.repository";
import { PatientSiteService } from "./services/patient-site.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PatientSite } from "./database/patient-site.entity";
import { Patient } from "../patient/database/patient.entity";
import { Site } from "../site/database/site.entity";
import { ProtocolsSites } from "./database/protocol-site.entity";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "../user/user.module";
import { PatientModule } from "../patient/patient.module";


const services = [PatientSiteService]
const repositories = [PatientSiteRepository]

@Module({
    imports: [
        TypeOrmModule.forFeature([PatientSite, ProtocolsSites, Patient, Site]),
        MongooseModule.forFeature([]),
        UserModule,
        PatientModule,
    ],
    providers: [...services, ...repositories],
    exports: []
})

export class PatientSiteModule {}
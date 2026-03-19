import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { Patient } from "./database/patient.entity";
import { PatientController } from "./controllers/patient.controller";
import { PatientService } from "./services/patient.service";
import { PatientRepository } from "./repositories/patient.repository";
import { PaginationService } from "../utils/pagination/services/pagination.service";
import { UserModule } from "../user/user.module";
import { UserService } from "../user/services/user.service";
import { HandleDBError } from "../utils/commonErrors/handle-db.error";
import { EmailService } from "../utils/mailers/email.service";
import { HashingService } from "../utils/commonservices/hashing.service";
import { ExportPatientService } from "./services/export-patients.service";
import { UpdatePatientStatusService } from "./services/update-patient-status.service";
import { UploadExcelService } from "./services/upload-excel.service";
import { SiteRepository } from "../site/repositories/site.repository";
import { UserRepository } from "../user/repositories/user.repository";
import { MongooseModule } from "@nestjs/mongoose";
import { PinoLoggerService } from "../utils/logger/pinoLogger.service";
import { PatientSiteRepository } from "../patient-site/repositories/patient-site.repository";
import { User } from "../user/database/user.orm";
import { PatientSite } from "../patient-site/database/patient-site.entity";
import { Site } from "../site/database/site.entity";
import { ProtocolsSites } from "./database/protocol-site.entity-orm";
import { PatientSiteService } from "../patient-site/services/patient-site.service";

const controllers = [PatientController];
const services = [PatientService, PaginationService, UserService, HandleDBError, EmailService, HashingService, ExportPatientService, UpdatePatientStatusService, UploadExcelService, PinoLoggerService, PatientSiteService];
const repositories = [PatientRepository, SiteRepository, UserRepository, PatientSiteRepository];

@Module({
    imports: [
        TypeOrmModule.forFeature([Patient, User, Patient, PatientSite, Site, ProtocolsSites]),
        MongooseModule.forFeature([]),
        UserModule,
    ],
    controllers,
    providers: [...services, ...repositories],
    exports: [PatientRepository]
})

export class PatientModule {}
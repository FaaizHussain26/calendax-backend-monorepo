import { Module } from "@nestjs/common";
import { PinoLoggerService } from "../utils/logger/pinoLogger.service";
import { PaginationService } from "../utils/pagination/services/pagination.service";
import { PatientStatusController } from "./controllers/patient-status.controller";
import { PatientStatusRepository } from "./repositories/patient-status.repository";
import { PatientStatusService } from "./services/patient-status.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PatientStatus } from "./database/patient-status.orm-entity";
import { Patient } from "../patient/database/patient.entity";
import { LoggerModule } from "../utils/logger/logger.module";

const controllers = [PatientStatusController];
const services = [PatientStatusService, PaginationService, PinoLoggerService];
const repositories = [PatientStatusRepository];

@Module({
    imports: [
        TypeOrmModule.forFeature([PatientStatus, Patient]),
        LoggerModule,
    ],
    controllers,
    providers: [...services, ...repositories],
    exports: []
})

export class PatientStatusModule {}
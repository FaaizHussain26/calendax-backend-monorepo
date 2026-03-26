import { Module } from "@nestjs/common";
import { PatientAppointmentRepository } from "./repositories/patient-appointment.repository";
import { PatientAppointmentService } from "./services/patient-appointment.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PatientAppointment } from "./database/patient-appointment.orm-entity";
import { SiteService } from "../site/services/site.service";
import { UserService } from "../user/services/user.service";
import { HashingService } from "../utils/commonservices/hashing.service";
import { PatientService } from "../patient/services/patient.service";
import { EmailService } from "../utils/mailers/email.service";
import { PinoLoggerService } from "../utils/logger/pinoLogger.service";
import { SiteRepository } from "../site/repositories/site.repository";
import { UserRepository } from "../user/repositories/user.repository";
import { PatientRepository } from "../patient/repositories/patient.repository";
import { HandleDBError } from "../utils/commonErrors/handle-db.error";
import { PaginationService } from "../utils/pagination/services/pagination.service";
import { Site } from "../site/database/site.entity";
import { User } from "../user/database/user.orm";
import { Patient } from "../patient/database/patient.entity";
import { PatientAppointmentController } from "./controllers/patient-appointment.controller";
import { LoggerModule } from "../utils/logger/logger.module";

const controllers = [PatientAppointmentController]
const services = [PatientAppointmentService, SiteService, UserService, PatientService, HashingService, EmailService, PinoLoggerService, HandleDBError, PaginationService]
const repositories = [PatientAppointmentRepository, SiteRepository, UserRepository, PatientRepository]

@Module({
    imports: [
        TypeOrmModule.forFeature([PatientAppointment, Site, User, Patient]),
        LoggerModule,
    ],
    controllers,
    providers: [...services, ...repositories],
    exports: [],
})
export class PatientAppointmentModule {}
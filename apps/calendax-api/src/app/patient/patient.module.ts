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

const controllers = [PatientController];
const services = [PatientService, PaginationService, UserService, HandleDBError];
const repositories = [PatientRepository];

@Module({
    imports: [
        TypeOrmModule.forFeature([Patient]),
        UserModule,
    ],
    controllers,
    providers: [...services, ...repositories],
    exports: []
})

export class PatientModule {}
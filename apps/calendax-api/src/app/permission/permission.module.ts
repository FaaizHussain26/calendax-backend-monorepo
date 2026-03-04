import { Module } from "@nestjs/common";
import { PermissionController } from "./controllers/permission.controller";
import { PermissionRepository } from "./repositories/permission.repository";
import { PermissionService } from "./services/permission.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "./database/permission.entity";
import { HandleDBError } from "../utils/commonErrors/handle-db.error";
import { PaginationService } from "../utils/pagination/services/pagination.service";

const controllers = [PermissionController]
const services = [PermissionService, PaginationService, HandleDBError]
const repositories = [PermissionRepository]

@Module({
    imports: [
        TypeOrmModule.forFeature([Permission]),
    ],
    controllers,
    providers: [...services, ...repositories],
    exports: [PermissionRepository]
})

export class PermissionModule {}
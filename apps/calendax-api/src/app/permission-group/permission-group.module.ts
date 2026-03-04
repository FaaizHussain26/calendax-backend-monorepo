import { Module } from "@nestjs/common";
import { PermissionGroupController } from "./controllers/permission-group.controller";
import { PermissionGroupRepository } from "./repositories/permission-group.repository";
import { PermissionGroupService } from "./services/permission-group.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PermissionGroup } from "./database/permission-group.entity";
import { Permission } from "../permission/database/permission.entity";
import { PaginationService } from "../utils/pagination/services/pagination.service";
import { HandleDBError } from "../utils/commonErrors/handle-db.error";

const controllers = [PermissionGroupController]
const services = [PermissionGroupService, PaginationService, HandleDBError]
const repositories = [PermissionGroupRepository]

@Module({
    imports: [
        TypeOrmModule.forFeature([PermissionGroup, Permission])
    ],
    controllers,
    providers: [...services, ...repositories],
    exports: [
        TypeOrmModule.forFeature([PermissionGroup]),
    ]
})

export class PermissionGroupModule {}
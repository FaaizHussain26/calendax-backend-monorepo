import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HandleDBError } from "../utils/commonErrors/handle-db.error";
import { PaginationService } from "../utils/pagination/services/pagination.service";
import { RoleController } from "./controllers/role.controller";
import { RoleRepository } from "./repositories/role.repository";
import { Role } from "./database/role.entity";
import { RoleService } from "./services/role.service";
import { PermissionRepository } from "../permission/repositories/permission.repository";
import { Permission } from "../permission/database/permission.entity";

const controllers = [RoleController]
const services = [RoleService, PaginationService, HandleDBError]
const repositories = [RoleRepository, PermissionRepository]

@Module({
    imports: [
        TypeOrmModule.forFeature([Role, Permission]),
    ],
    controllers,
    providers: [...services, ...repositories],
    exports: []
})

export class RoleModule {}
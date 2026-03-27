import { Module } from "@nestjs/common";
import { AdminSeeder } from "./admin.seeder";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { JwtCommonModule } from "src/common/jwt/jwt.module";
import { AdminRepository } from "./admin.repository";
import { AdminEntity } from "./entities/admin.entity";
import { AdminPermissions } from "./entities/admin-permissions.entity";

const services = [AdminService];
const repositories = [AdminRepository];
const controllers = [AdminController];

@Module({
    imports: [
        TypeOrmModule.forFeature([AdminEntity, AdminPermissions]),
        JwtCommonModule,
    ],
    controllers,
    providers: [...services, ...repositories, AdminSeeder],
    exports: [],
})

export class AdminModule {}
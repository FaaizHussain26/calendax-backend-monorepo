import { Module } from "@nestjs/common";
import { TenantController } from "./tenant.controller";
import { TenantRepository } from "./tenant.repository";
import { TenantService } from "./tenant.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminEntity } from "../admin/entities/admin.entity";
import { TenantEntity } from "./tenant.entity";

const controllers = [TenantController];
const repostories = [TenantRepository];
const services = [TenantService];

@Module({
    imports: [
        TypeOrmModule.forFeature([TenantEntity, AdminEntity])
    ],
    controllers,
    providers: [...services, ...repostories]
})

export class TenantModule{}
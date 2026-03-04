import { Module } from "@nestjs/common";
import { SiteController } from "./controllers/site.controller";
import { SiteRepository } from "./repositories/site.repository";
import { SiteService } from "./services/site.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Site } from "./database/site.entity";
import { UserModule } from "../user/user.module";
import { PaginationService } from "../utils/pagination/services/pagination.service";

const controllers = [SiteController]
const services = [SiteService, PaginationService]
const repositories = [SiteRepository]

@Module({
    imports: [
        TypeOrmModule.forFeature([Site]),
        UserModule,
    ],
    controllers,
    providers: [...services, ...repositories],
})

export class SiteModule {};
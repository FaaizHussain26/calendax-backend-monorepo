import { Module } from "@nestjs/common";
import { PageController } from "./page.controller";
import { PageRepository } from "./page.repository";
import { PageService } from "./page.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PageEntity } from "./page.entity";
import { AdminEntity } from "../admin/entities/admin.entity";

const controllers = [PageController];
const repostories = [PageRepository];
const services = [PageService];

@Module({
    imports: [
        TypeOrmModule.forFeature([PageEntity],'master')
    ],
    controllers,
    providers: [...services, ...repostories]
})

export class PageModule{}
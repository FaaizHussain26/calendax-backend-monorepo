import { Module } from "@nestjs/common";
import { PageController } from "./page.controller";
import { PageRepository } from "./page.repository";
import { PageService } from "./page.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PageEntity } from "./page.entity";
import { JwtCommonModule } from "../../common/jwt/jwt.module";

const controllers = [PageController];
const repostories = [PageRepository];
const services = [PageService];

@Module({
    imports: [
        TypeOrmModule.forFeature([PageEntity],'master'),JwtCommonModule
    ],
    controllers,
    providers: [...services, ...repostories]
})

export class PageModule{}
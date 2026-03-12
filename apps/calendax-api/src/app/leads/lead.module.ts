import { Module } from "@nestjs/common";
import { LeadsController } from "./controllers/leads.controller";
import { LeadRepository } from "./repositories/lead.repository";
import { LeadService } from "./services/lead.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Lead } from "./database/lead.orm-entity";
import { LeadsPlatform } from "./database/leads-platform.orm-entity";
import { PaginationService } from "../utils/pagination/services/pagination.service";
import { OutsideLeadRepository } from "./repositories/outside-lead.repository";
import { OutSideLeadsController } from "./controllers/outside-lead.controller";
import { OutsideLeadService } from "./services/outside-lead.service";

const controllers = [LeadsController, OutSideLeadsController];
const repositories = [LeadRepository, OutsideLeadRepository];
const services = [LeadService, OutsideLeadService, PaginationService];

@Module({
    imports: [
        TypeOrmModule.forFeature([Lead, LeadsPlatform]),
    ],
    controllers,
    providers: [...repositories, ...services],
    exports: [],
})
export class LeadsModule {};
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, In, Repository } from "typeorm";
import { Site } from "../database/site.entity";
import { PaginationRequest } from "../../utils/pagination/interfaces";
import { PaginationService } from "../../utils/pagination/services/pagination.service";
import { DeleteResult } from "typeorm/browser";

@Injectable()
export class SiteRepository {
    constructor(
        @InjectRepository(Site) private readonly siteRepository: 
        Repository<Site>,
        private paginationService: PaginationService,
    ) {}

    async getSitesListing(): Promise<Site[] | null> {
        const sites = await this.siteRepository.find({
            where: {},
        });
        if(!sites) return null;
        return sites;
    };

    async getSites(
        pagination: PaginationRequest,
        siteIds: number[] = [],
        isAdmin: boolean = false,
    ): Promise<[siteEntities: Site[], totalSites: number]> {
        const params = pagination.params;
        const hasSiteIds = !isAdmin && siteIds && siteIds.length > 0;
        const hasEventIds = Boolean(params.eventIds);
        const hasCondtitions = hasSiteIds || hasEventIds;

        const whereCondition = hasCondtitions? (qb) => {
            if(hasSiteIds) {
                qb.where("entity.id IN (:...siteIds)", { siteIds });
            }
            if(hasEventIds) {
                qb.innerJoin(
                    "event_sites",
                    "eventSites",
                    "eventSites.site_id = entity.id",
                );

                const eventCondition = Array.isArray(params.eventIds)
                ? "eventSites.event_id IN (:...eventIds)"
                : "eventSites.event_id = :eventIds";

                if(hasSiteIds) {
                    qb.andWhere(eventCondition, { eventIds: params.eventIds });
                } else {
                qb.where(eventCondition, { eventIds: params.eventIds });  
                }
            }
        }: null;
        return await this.paginationService.getPaginatedDataWithCount(
            this.siteRepository,
            [],
            pagination,
            whereCondition,
        );
    }

    async getSitesById(ids: number[]): Promise<Site[] | null> {
        const sites = await this.siteRepository.findBy({ id: In(ids) });
        if(!sites) return null;
        return sites;
    }

    async getSiteBySiteNumber(siteNumber: Site["siteNumber"]): Promise<Site | null> {
        const site = await this.siteRepository.findOneBy({ siteNumber });
        if(!site) return null;
        return site;
    };

    async getSitesBySiteNumbers(siteNumbers: string[]): Promise<Site[]> {
        if(!siteNumbers || siteNumbers.length === 0) return [];

        const sites = await this.siteRepository.findBy({
            siteNumber: In(siteNumbers),
        });

        return sites || [];
    }

    async getSiteBySiteEmail(
        siteEmail: Site["email"],
    ): Promise<Site | null> {
        const site = await this.siteRepository.findOneBy({
            email: siteEmail
        });
        if(!site) return null;
        return site;
    }

    async getSiteBySiteName(siteName: Site["name"]): Promise<Site | null> {
        const site = await this.siteRepository.findOneBy({
            name: siteName
        });
        if(!site) return null;
        return site;
    }

    async getSiteByPhoneNumber(phoneNumber: Site["phoneNumber"]): Promise<Site | null> {
        const site = await this.siteRepository.findOneBy({
            phoneNumber: phoneNumber
        });
        if(!site) return null;
        return site;
    }

    async getById(id: Site["id"]): Promise<Site | null> {
        const site = await this.siteRepository.findOneBy({ id });
        if(!site) return null;
        return site;
    }

    async create(site: DeepPartial<Site>): Promise<Site | null> {
        const siteCreated = await this.siteRepository.save(site);
        return siteCreated;
    }

    async update(id: Site["id"],site: Site): Promise<Site | null> {
        const existingSite = await this.siteRepository.findOne({ where: { id } });
        if(!existingSite) throw new BadRequestException("Appointment not found");

        await this.siteRepository.update(id, site);
        const updatedSite = await this.siteRepository.findOneBy({ id });
        return updatedSite;
    }

    async delete(siteId: Site["id"]): Promise<DeleteResult | null> {
        const site = await this.siteRepository.findOneBy({ id: siteId });
        if (!site) return null;
        const result = await this.siteRepository.delete(siteId);
        result.raw = {
            ...result.raw,
            deletedSite: site,
        };
        return result;
    }
}
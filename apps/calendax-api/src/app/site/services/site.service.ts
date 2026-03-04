import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { SiteRepository } from "../repositories/site.repository";
import { SiteResponseDto } from "../dtos/site-response.dto";
import { Site } from "../database/site.entity";
import { PaginationRequest } from "../../utils/pagination/interfaces";
import { PaginationResponseDto } from "../../utils/pagination/pagination-response.dto";
import { Pagination } from "../../utils/pagination/pagination.helper";
import { CreateSiteDto } from "../dtos/create-site.dto";
import { BadRequestException } from "../../utils/exceptions/common.exceptions";
import { UserService } from "../../user/services/user.service";
import { plainToInstance } from "class-transformer";
import { TimeoutError } from "rxjs";
import { DeleteResult } from "typeorm";

@Injectable()
export class SiteService {
    constructor(
        private readonly siteRepository: SiteRepository,
        private readonly userService: UserService,
    ) {}

    async getList(payload: { query : string }): Promise<Site[]> {
        const sites = await this.siteRepository.getSitesListing();
        return sites;
    }

    async getSites(pagination: PaginationRequest, siteIds: number[], isAdmin: boolean):
    Promise<PaginationResponseDto<SiteResponseDto>> {
        const [sites, total] = await this.siteRepository.getSites(pagination, siteIds, isAdmin);
        const dtos = sites.map(site => plainToInstance(SiteResponseDto, site));
        return Pagination.of(pagination, total, dtos);
    }

    async getSitesById(id: Site["id"]): Promise<Site[] | SiteResponseDto[]> {
        const site = await this.siteRepository.getSitesById([id]);
        return site;
    }

    async createSites(payload: CreateSiteDto): Promise<SiteResponseDto> {
        try {
            if(payload.name.length > 100) {
                throw new BadRequestException(
                    "Site name cannot be longer than 100 characters"
                );
            }

            const siteName = await this.siteRepository.getSiteBySiteName(payload.name);
            if(siteName) {
                throw new BadRequestException(
                    `Site with name ${payload.name} already exists`
                );
            }

            const siteExists = await this.siteRepository.getSiteBySiteNumber(payload.siteNumber);
            if(siteExists) {
                throw new BadRequestException(
                    `Site with number ${payload.siteNumber} already exists`
                );
            }

            if(
                payload.principalInvestigatorIds &&
                payload.principalInvestigatorIds.length > 0
            ) {
                for(const userId of payload.principalInvestigatorIds) {
                    const userExists = await this.userService.getUserByIdWithPI(userId);
                    if(!userExists) {
                        throw new BadRequestException(
                            `User with id ${userId} does not exists or User is not PI`
                        );
                    };
                };
            };

            const site = await this.siteRepository.create(payload);
            return plainToInstance(SiteResponseDto, site);
        }catch(error) {
            throw new BadRequestException(error.message);
        }
    }

    async updateSites(
        siteId: Site['id'],
        payload: CreateSiteDto,
    ): Promise<SiteResponseDto> {
        try {
            const previousSite = await this.siteRepository.getById(siteId);
            const site = plainToInstance(Site, {...previousSite, ...payload});

            if(
                payload.principalInvestigatorIds &&
                payload.principalInvestigatorIds.length > 0
            ) {
                for (const userId of payload.principalInvestigatorIds) {
                    const userExists = await this.userService.getUserByIdWithPI(userId);
                    if(!userExists) {
                        throw new BadRequestException(
                            `User with ${userId} does not exists or User is not PI.`
                        );
                    }
                }
            }
            
            const siteUpdated = await this.siteRepository.update(siteId, site);
            return plainToInstance(SiteResponseDto, siteUpdated);
        }catch(error) {
            if(error instanceof InternalServerErrorException) {
                throw new BadRequestException(error.message);
            }
            if(error instanceof TimeoutError) {
                throw new BadRequestException(error.message);
            }
            throw new BadRequestException(
                `Failed to create appointment: ${error.message}`
            );
        }
    }

    async deleteSite(id: number): Promise<DeleteResult> {
        return await this.siteRepository.delete(id);
    }
}
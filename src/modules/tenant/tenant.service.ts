import { BadRequestException, Injectable } from "@nestjs/common";
import { TenantRepository } from "./tenant.repository";

import { CreateTenantDto, TenantResponseDto, UpdateTenantDto } from "./tenant.dto";
import { plainToInstance } from "class-transformer";
import { entityNotFound } from "../../utils/exceptions/notFound.exception";

@Injectable()
export class TenantService {
    constructor(
        private readonly tenantRepository: TenantRepository,
    ) {}

    async getAllTenants() {
        try {
            return await this.tenantRepository.getAllTenants();
        }catch(error:any) {
            throw new BadRequestException(error.message);
        }
    }

    async getTenantById(id: string) {
        try {
            const tenant = await this.tenantRepository.getByTenantId(id);
            entityNotFound(tenant, "Tenant");
            return tenant;
        }catch(error:any) {
            throw new BadRequestException(error.message);
        }
    }

    async createTenant(payload: CreateTenantDto) {
        try {
            const createdEntity = await this.tenantRepository.createTenant(payload);
            return plainToInstance(TenantResponseDto, createdEntity);
        }catch(error:any) {
            throw new BadRequestException(error.message);
        }
    }

    async update(id: string, payload: UpdateTenantDto) {
        try {
            const tenant = await this.tenantRepository.getByTenantId(id);
            entityNotFound(tenant, "Tenant");
            await this.tenantRepository.updateTenant(id, payload);
            const updatedEntity = await this.tenantRepository.getByTenantId(id);
            return plainToInstance(TenantResponseDto, updatedEntity, {
                excludeExtraneousValues: true
            });
        }catch(error:any) {
            throw new BadRequestException(error.message);
        }
    }

    async deleteTenant(id: string) {
        try {
            const tenant = await this.tenantRepository.getByTenantId(id);
            entityNotFound(tenant, "Tenant");
            await this.tenantRepository.delete(id);
             return { message: "Tenant deleted successfully" };
        }catch(error:any) {
            throw new BadRequestException(error.message);
        }
    }
}
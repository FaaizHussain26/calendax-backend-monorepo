import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { TenantService } from "./tenant.service";
import { CreateTenantDto, UpdateTenantDto } from "./tenant.dto";

@Controller("/tenant")
export class TenantController {
    constructor(
        private readonly tenantService: TenantService
    ) {}

    @Get("/")
    async getAllTenants() {
        return await this.tenantService.getAllTenants();
    }

    @Get("/:id")
    async gettenantsById(@Param('id', ParseUUIDPipe) id: string) {
        return await this.tenantService.getTenantById(id);
    }

    @Post("/")
    async createTenant(@Body() payload: CreateTenantDto) {
        return await this.tenantService.createTenant(payload);
    }

    @Patch("/:id")
    async updateTenant(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() payload: UpdateTenantDto
    ) {
        return await this.tenantService.update(id, payload);
    }

    @Delete("/:id")
    async deleteTenant(@Param('id', ParseUUIDPipe) id: string) {
     return   await this.tenantService.deleteTenant(id);
       
    }
}
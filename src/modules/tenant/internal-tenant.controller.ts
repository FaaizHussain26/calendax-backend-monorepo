// Add these two endpoints to src/modules/tenant/tenant.controller.ts
// (alongside existing GET /internal/tenants/:id)

import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { InternalApiKeyGuard } from '@libs/common/guards/internal-api.guard';

@Controller('internal/tenants')
@UseGuards(InternalApiKeyGuard)
export class InternalTenantController {

  constructor(private readonly service: TenantService) {}


  @Get('active')
  getActiveTenants(): Promise<Array<{ id: string; slug: string }>> {
    return this.service.getActiveTenants();
  }

  @Get(':id')
  getConnectionDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getConnectionDetails(id);
  }
}
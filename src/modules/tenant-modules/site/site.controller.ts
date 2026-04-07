// site.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SiteService } from './site.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import type { RequestWithUser } from '../../../common/interfaces/request.interface';
import { CreateSiteDto, UpdateSiteDto } from './site.dto';
import { JwtAuthGuard } from '../../../common/jwt/jwt.provider';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../../common/guards/permission.guard';

@Controller('sites')
@UseGuards(JwtAuthGuard,TenantGuard,PermissionsGuard)
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.siteService.findAll(query);
  }

  @Get('my-sites') 
  findMySites(@Req() req: RequestWithUser) {
    return this.siteService.findMySites(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.siteService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateSiteDto) {
    return this.siteService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSiteDto) {
    return this.siteService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.siteService.remove(id);
  }
}
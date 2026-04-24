import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PageService } from './page.service';
import { CreatePageDto, UpdatePageDto, UpdatePageIndexDto } from './page.dto';
import { JwtAuthGuard } from '../../services/jwt/jwt.provider';
import { RolesGuard } from '@libs/common/guards/roles.guard';
import { PermissionsGuard } from '@libs/common/guards/permission.guard';
import { AdminPage } from '@libs/common/enums/admin.enum';
import { Roles } from '@libs/common/decorators/roles.decorator';
import { Permission } from '@libs/common/decorators/permission.decorator';
import { AllRoles, PermissionNames } from '@libs/common/enums/system.enum';
import { PaginationDto } from '@libs/common/dto/pagination.dto';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(AllRoles.SUPER_ADMIN, AllRoles.ADMIN)
@Controller('/page')
export class PageController {
  constructor(private readonly pageService: PageService) {}
  @Get('/')
  async getAllPages(@Query() query: PaginationDto) {
    return await this.pageService.findAllPages(query);
  }

  @Get('/:id')
  async getpagesById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.pageService.getPageById(id);
  }
  @Post('/')
  async createPage(@Body() payload: CreatePageDto) {
    return await this.pageService.createPage(payload);
  }
  @Patch('/:id')
  async updatePage(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdatePageDto) {
    return await this.pageService.update(id, payload);
  }
  @Patch('/index/:id')
  async updatePageByIndex(@Param('id',ParseUUIDPipe) id: string, @Body() payload: UpdatePageIndexDto) {
    return await this.pageService.updatePageByIndex(id, payload);
  }

  @Delete('/:id')
  async deletePage(@Param('id', ParseUUIDPipe) id: string) {
    return await this.pageService.deletePage(id);
  }
}

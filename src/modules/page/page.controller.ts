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
import { CreatePageDto, UpdatePageDto } from './page.dto';
import { JwtAuthGuard } from '../../common/jwt/jwt.provider';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permission.guard';
import { AdminPage } from '../../enums/admin.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permission } from '../../common/decorators/permission.decorator';
import { AllRoles, PermissionNames } from '../../enums/system.enum';
import { PaginationDto } from '../../common/dto/pagination.dto';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(AllRoles.SUPER_ADMIN, AllRoles.ADMIN)
@Controller('/page')
export class PageController {
  constructor(private readonly pageService: PageService) {}
  @Get('/')
  @Permission(AdminPage.PAGE, PermissionNames.READ)
  async getAllPages(@Query() query: PaginationDto) {
    return await this.pageService.findAllPages(query);
  }

  @Get('/:id')
  @Permission(AdminPage.PAGE, PermissionNames.READ)
  async getpagesById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.pageService.getPageById(id);
  }
  @Post('/')
  @Permission(AdminPage.PAGE, PermissionNames.WRITE)
  async createPage(@Body() payload: CreatePageDto) {
    return await this.pageService.createPage(payload);
  }
  @Patch('/:id')
  @Permission(AdminPage.PAGE, PermissionNames.UPDATE)
  async updatePage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdatePageDto,
  ) {
    return await this.pageService.update(id, payload);
  }
  @Delete('/:id')
  @Permission(AdminPage.PAGE, PermissionNames.DELETE)
  async deletePage(@Param('id', ParseUUIDPipe) id: string) {
    return await this.pageService.deletePage(id);
  }
}

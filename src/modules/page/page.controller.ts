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
import { JwtAuthGuard } from '../../services/jwt/jwt.provider';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permission.guard';
import { AdminPage } from '../../common/enums/admin.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permission } from '../../common/decorators/permission.decorator';
import { AllRoles, PermissionNames } from '../../common/enums/system.enum';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UpdatePageIndexDto } from '../../common/dto/page.dto';

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

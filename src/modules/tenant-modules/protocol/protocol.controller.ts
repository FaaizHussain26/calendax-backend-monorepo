// protocol.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UploadedFile, UseGuards } from '@nestjs/common';
import { ProtocolService } from './protocol.service';
import { CreateProtocolDto, ListAllProtocolQueryDto, UpdateProtocolDto } from './protocol.dto';
import { UploadFile } from '../../../common/decorators/upload.decorator';
import { PermissionsGuard } from '../../../common/guards/permission.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../../services/jwt/jwt.provider';

@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('protocols')
export class ProtocolController {
  constructor(private readonly protocolService: ProtocolService) {}

  @Get()
  findAll(@Query() query: ListAllProtocolQueryDto) {
    return this.protocolService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.protocolService.findById(id);
  }

  @Post()
  @UploadFile({
  destination: 'uploads/protocols',
  allowedTypes: ['application/pdf'],
  maxSizeMB: 10,
  fieldName: 'document',
})
  create(@Body() dto: CreateProtocolDto,@UploadedFile() file: Express.Multer.File,) {
    return this.protocolService.create(dto,file);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProtocolDto) {
    return this.protocolService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.protocolService.remove(id);
  }
}

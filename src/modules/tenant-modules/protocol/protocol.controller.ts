// protocol.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ProtocolService } from './protocol.service';
import { CreateProtocolDto, UpdateProtocolDto } from './protocol.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Controller('protocols')
export class ProtocolController {
  constructor(private readonly protocolService: ProtocolService) {}

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.protocolService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.protocolService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateProtocolDto) {
    return this.protocolService.create(dto);
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
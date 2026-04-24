import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto, UpdatePatientDto, PrefilledPatientDto } from './patient.dto';
import { PatientEntity } from './patient.entity';

@Controller('patients')
export class PatientController {
  constructor(private readonly service: PatientService) {}

  @Get()
  findAll(@Query('siteId') siteId?: string): Promise<PatientEntity[]> {
    if (siteId) return this.service.findBySite(siteId);
    return this.service.findAll();
  }

  @Get('from-lead/:leadId')
  getPrefilledFromLead(
    @Param('leadId', ParseUUIDPipe) leadId: string,
  ): Promise<PrefilledPatientDto> {
    return this.service.getPrefilledFromLead(leadId);
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<PatientEntity> {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreatePatientDto): Promise<PatientEntity> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePatientDto,
  ): Promise<PatientEntity> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.service.remove(id);
  }
}

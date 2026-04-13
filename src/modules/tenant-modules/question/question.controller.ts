import {
  Controller, Get, Post, Patch,
  Delete, Param, Body, Query,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import {
  CreateQuestionDto,
  CreateBulkQuestionsDto,
  UpdateQuestionDto,
  ListQuestionsQueryDto,
  GenerateQuestionDto,
} from './question.dto';
import type { TenantRequest } from '../../../common/interfaces/request.interface';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  findAll(@Query() query: ListQuestionsQueryDto) {
    return this.questionService.findAll(query);
  }

  @Get('protocol/:protocolId')
  findByProtocol(@Param('protocolId', ParseUUIDPipe) protocolId: string) {
    return this.questionService.findByProtocolId(protocolId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateQuestionDto) {
    return this.questionService.create(dto);
  }

@Post('generate')
  async generate(
    @Body() dto: GenerateQuestionDto,
    @Req() req: TenantRequest,
  ) {
    return this.questionService.generateQuestions(
      dto.protocolId,
      dto.documentId,
      req.tenantConnection.mongo!,
      dto.indication,
      dto.additionalContext,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.questionService.update(id, dto);
  }

  @Patch(':id/approve')
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionService.approve(id);
  }

  @Patch(':id/reject')
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionService.reject(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionService.remove(id);
  }
}
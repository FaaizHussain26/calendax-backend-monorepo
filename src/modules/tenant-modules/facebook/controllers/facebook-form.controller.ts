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
import { FacebookFormService, FacebookPageWithForms } from '../services/facebook-form.service';
import { ConnectFormDto, UpdateFormConnectionDto } from '../dto/facebook-form.dto';
import { FacebookFormEntity } from '../entities/facebook-form.entity';

@Controller('facebook')
export class FacebookFormController {
  constructor(private readonly service: FacebookFormService) {}

  /**
   * GET /facebook/pages
   * Returns all pages + forms from Graph API.
   * Each form is flagged isConnected: true/false.
   */
  @Get('pages')
  getPagesWithForms(): Promise<FacebookPageWithForms[]> {
    return this.service.getPagesWithForms();
  }

  /**
   * POST /facebook/forms/connect
   * Connects a form to a protocol + calling config.
   */
  @Post('forms/connect')
  connect(@Body() dto: ConnectFormDto): Promise<FacebookFormEntity> {
    return this.service.connect(dto);
  }

  /**
   * PATCH /facebook/forms/:id
   * Updates an existing form connection.
   */
  @Patch('forms/:id')
  updateConnection(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFormConnectionDto,
  ): Promise<FacebookFormEntity> {
    return this.service.updateConnection(id, dto);
  }

  /**
   * DELETE /facebook/forms/:id
   * Disconnects a form.
   */
  @Delete('forms/:id')
  disconnect(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.service.disconnect(id);
  }
}

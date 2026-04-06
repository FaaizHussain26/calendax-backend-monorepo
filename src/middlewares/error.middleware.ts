import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response, Request } from 'express';
import { QueryFailedError } from 'typeorm';
import { HttpErrorResponse } from '../common/interfaces/request.interface';

@Catch()
export class ErrorResponseFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP-EXCEPTION');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorData: string | null = null;

    // If it's an HttpException (BadRequest, Unauthorized, etc.)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else if (typeof errorResponse === 'object') {
        const typed = errorResponse as HttpErrorResponse;
        message = typed?.message || exception.message || 'Something went wrong';
        errorData = typed?.error || null;
      }
    } else if (exception instanceof QueryFailedError) {
      const err = exception as QueryFailedError & {
        code: string;
        detail: string;
      };

      if (err.code === '23505') {
        // PostgreSQL unique violation code
        status = HttpStatus.BAD_REQUEST;
        message = err.detail || 'Duplicate entry violation';
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database error';
      }
    }
    // 🔥 STRUCTURED JSON LOG
    this.logger.error(
      'HTTP_EXCEPTION',
      JSON.stringify({
        level: 'error',
        service: 'calendax-api',
        method: request.method,
        path: request.url,
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        requestId: request.headers['x-request-id'] || null,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    );
    return response.status(status).json({
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      metadata: null,
      message,
      data: errorData,
    });
  }
}

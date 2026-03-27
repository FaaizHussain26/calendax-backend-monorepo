import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
 
@Catch()
export class ErrorResponseFilter implements ExceptionFilter {
    private readonly logger = new Logger('HTTP-EXCEPTION');
 
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
 
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorData: any = null;
 
    // If it's an HttpException (BadRequest, Unauthorized, etc.)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
 
      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else if (typeof errorResponse === 'object') {
        message =
          (errorResponse as any)?.message ||
          exception.message ||
          'Something went wrong';
        errorData = (errorResponse as any)?.error || null;
      }
    } else if (exception.code === 11000 && exception?.keyValue) {
      // ✅ Handle MongoDB duplicate key error
      status = 400;
      message = Object.keys(exception?.keyValue)
        .map((key) => `${key}: ${exception?.keyValue[key]} already exists`)
        .join(', ');
    } else if (exception instanceof Error) {
      message = exception.message;
    }
    // 🔥 STRUCTURED JSON LOG
    this.logger.error(
      'HTTP_EXCEPTION',
      JSON.stringify({
        level: 'error',
        service: 'rentalink-api',
        method: request.method,
        path: request.url,
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        requestId: request.headers['x-request-id'] || null,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        stack: exception?.stack,
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
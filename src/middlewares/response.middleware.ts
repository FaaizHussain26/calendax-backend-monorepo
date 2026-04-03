import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
 
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
 
    return next.handle().pipe(
      map((response) => {
        let metadata: any = null;
        let data: any = response;
        let message: string = '';
        if (response && typeof response === 'object' && 'message' in response) {
          message = response.message;
          data = response.data;
        }
        // Detect pagination object
        if (
          response &&
          typeof response === 'object' &&
          'data' in response &&
          'total' in response &&
          'page' in response &&
          'limit' in response
        ) {
          const { total, page, limit } = response;
 
          metadata = {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          };
 
          data = response?.data; // extract actual data
        }
 
        return {
          success: true,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          metadata,
          message: message || '',
          data,
        };
      }),
    );
  }
}
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MessageResponse, PaginatedResponse, PaginationMeta } from '@libs/common//interfaces/response.interface';

function isPaginated<T>(res: unknown): res is PaginatedResponse<T> {
  return typeof res === 'object' && res !== null && 'data' in res && 'total' in res && 'page' in res && 'limit' in res;
}

function isMessageResponse<T>(res: unknown): res is MessageResponse<T> {
  return typeof res === 'object' && res !== null && 'message' in res;
}
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((response) => {
        let metadata: PaginationMeta | null = null;
        let data: unknown = response;
        let message = '';
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

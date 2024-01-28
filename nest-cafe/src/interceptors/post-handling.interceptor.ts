import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

type PostInterseptorHandler = (data: any, context: ExecutionContext) => any;

export class PostHandlingInterseptor implements NestInterceptor {
  constructor(private fn: PostInterseptorHandler) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data: any) => {
        return this.fn(data, context);
      }),
    );
  }
}

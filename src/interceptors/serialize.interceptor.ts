import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';

interface ClassConstructor {
  new (...args: any[]): {}; // means class
}

export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data: any) => {
        return plainToClass(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}

export function SerializeAuth(dto: ClassConstructor) {
  return UseInterceptors(new SerializeAuthInterceptor(dto));
}

export class SerializeAuthInterceptor implements NestInterceptor {
  constructor(private dto: any) {}
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data: any) => {
        const [req, res, next] = context.getArgs();
        res.setHeader('Authorization', `Bearer ${data.jwt}`);
        res.cookie('jwt', data.jwt);
        return {
          jwt: data.jwt,
          user: plainToClass(this.dto, data.user, {
            excludeExtraneousValues: true,
          }),
        };
      }),
    );
  }
}

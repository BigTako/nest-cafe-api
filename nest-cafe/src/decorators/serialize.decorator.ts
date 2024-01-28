import { UseInterceptors, ExecutionContext } from '@nestjs/common';

import { plainToClass } from 'class-transformer';
import { PostHandlingInterseptor } from '../interceptors/post-handling.interceptor';

interface ClassConstructor {
  new (...args: any[]): {}; // means class
}

export function Serialize(dto: ClassConstructor) {
  const serialize = (data: any, context: ExecutionContext) => {
    return plainToClass(dto, data, { excludeExtraneousValues: true });
  };
  return UseInterceptors(new PostHandlingInterseptor(serialize));
}

import { UseInterceptors, ExecutionContext } from '@nestjs/common';

import { PostHandlingInterseptor } from '../interceptors/post-handling.interceptor';

/** 
 * Sets authorization headers and cookies.
  @param {string} tokenField - The name the field in data object that contains the jwt token.
  */
export function SetAuthorization(tokenField: string) {
  function fn(data: any, context: ExecutionContext) {
    const [req, res, next] = context.getArgs();
    res.setHeader('Authorization', `Bearer ${data.jwt}`);
    res.cookie('jwt', data.jwt);
    return data;
  }
  return UseInterceptors(new PostHandlingInterseptor(fn));
}

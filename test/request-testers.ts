import { INestApplication } from '@nestjs/common';
import {
  RequestRejectTest,
  RequestResolveTest,
} from '../src/utils/request-testing-utils';

////////////////////////////////////////////////////////////////
///// RESOLVERS  //////////////////////////////////////////////
////////////////////////////////////////////////////////////////

export const getResolver = (app: INestApplication, jwt: string) =>
  new RequestResolveTest(app, 200, 'get').setJWT(jwt);

export const postResolver = (app: INestApplication, jwt: string) =>
  new RequestResolveTest(app, 201, 'post').setJWT(jwt);

export const patchResolver = (app: INestApplication, jwt: string) =>
  new RequestResolveTest(app, 200, 'patch').setJWT(jwt);

export const deleteResolver = (app: INestApplication, jwt: string) =>
  new RequestResolveTest(app, 200, 'delete').setJWT(jwt);

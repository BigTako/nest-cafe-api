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

////////////////////////////////////////////////////////////////
///// REJECTORS  //////////////////////////////////////////////
////////////////////////////////////////////////////////////////
export const unauthorizedRejector = (app: INestApplication, jwt: string) =>
  new RequestRejectTest(
    app,
    401,
    'get',
    'You are not logged in! Please log in to get access.',
  ).setJWT(jwt);

export const forbiddenRejector = (app: INestApplication, jwt: string) =>
  new RequestRejectTest(
    app,
    403,
    'get',
    'You do not have permission to perform this action',
  ).setJWT(jwt);

export const notFoundRejector = (app: INestApplication, jwt: string) =>
  new RequestRejectTest(app, 404, 'get', 'Document not found').setJWT(jwt);

export const badRequestRejector = (app: INestApplication, jwt: string) =>
  new RequestRejectTest(app, 400, 'get', 'Bad request').setJWT(jwt);

export const passwordUpdateRejector = (app: INestApplication, jwt: string) =>
  new RequestRejectTest(
    app,
    403,
    'patch',
    'Password cannot be changed here. User /me/updatePassword instead.',
  ).setJWT(jwt);

export const incorrectCurrentPasswordRejector = (
  app: INestApplication,
  jwt: string,
) =>
  new RequestRejectTest(
    app,
    400,
    'patch',
    'Given current password is incorrect',
  ).setJWT(jwt);

export const absentRequiredFieldRejector = (
  app: INestApplication,
  jwt: string,
  message: string,
) => new RequestRejectTest(app, 400, 'post', message).setJWT(jwt);

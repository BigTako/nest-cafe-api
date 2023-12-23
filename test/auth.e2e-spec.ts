import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/users/user.entity';
import { UsersService } from '../src/users/users.service';
import {
  dumpAdmin,
  dumpDeletedUser,
  dumpNotActivatedUser,
} from './users-test-data';
import { RequestRejectTest } from '../src/utils/request-testing-utils';
import { badRequestRejector, postResolver } from './request-testers';

let RejectsInvalidCredentials: RequestRejectTest;

describe('Authentication testing (e2e)', () => {
  let app: INestApplication;
  let userService: UsersService;
  let jwt: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // clean test database
    const dataSource = app.get(DataSource);
    await dataSource.createQueryBuilder().delete().from(User).execute();

    userService = app.get<UsersService>(UsersService);

    userService = app.get(UsersService);

    await userService.create(dumpAdmin as User);

    await userService.create(dumpNotActivatedUser as User);

    await userService.create(dumpDeletedUser as User);

    RejectsInvalidCredentials = badRequestRejector(app, '').setMessage(
      'Incorrect email or password',
    );
  });

  describe('SIGNUP', () => {
    it('throws an error when trying to signup with email which is in use', async () => {
      return new RequestRejectTest(
        app,
        400,
        'post',
        `email ${dumpAdmin.email} already exists`,
      )
        .setBody(dumpAdmin)
        .test('/auth/signup');
    });

    it('throws an error when trying to signup with invalid email', async () => {
      return new RequestRejectTest(app, 400, 'post', 'email must be an email')
        .setBody({
          name: 'van2',
          email: 'vangmail.com',
          password: '12345678',
          passwordConfirm: '12345678',
        })
        .test('/auth/signup');
    });

    it('throws an error when trying to signup with invalid password confirm', async () => {
      return new RequestRejectTest(
        app,
        400,
        'post',
        'passwordConfirm must match password',
      )
        .setBody({
          name: dumpAdmin.name,
          email: dumpAdmin.email,
          password: dumpAdmin.password,
          passwordConfirm: dumpAdmin.password + '12345sdfsdf678',
        })
        .test('/auth/signup');
    });

    it('throws an error when trying to signup without required fields', async () => {
      return new RequestRejectTest(app, 400, 'post', 'name must be a string')
        .setBody({
          email: dumpAdmin.email,
          password: dumpAdmin.password,
          passwordConfirm: dumpAdmin.passwordConfirm,
        })
        .test('/auth/signup');
    });
  });

  describe('LOGIN', () => {
    it('throws an error when trying to login to unactivated account', async () => {
      return RejectsInvalidCredentials.setMethod('post')
        .setBody({
          email: dumpNotActivatedUser.email,
          password: dumpNotActivatedUser.password,
        })
        .test('/auth/login');
    });

    it('throws an error when trying to login to deactivated account', async () => {
      return RejectsInvalidCredentials.setMethod('post')
        .setBody({
          email: dumpDeletedUser.email,
          password: dumpDeletedUser.password,
        })
        .test('/auth/login');
    });

    it('handles login with valid credentials', async () => {
      return postResolver(app, '')
        .setBody({ email: dumpAdmin.email, password: dumpAdmin.password })
        .test('/auth/login', (res) => {
          expect(res.body).toBeDefined();
          expect(res.body.jwt).toBeDefined();
          expect(res.body.user).toBeDefined();
          jwt = res.body.jwt;
        });
    });

    it('throws BadRequestException trying to login to unexisting account', async () => {
      return RejectsInvalidCredentials.setBody({
        email: 'van123@gmail.com',
        password: '12345678',
      }).test('/auth/login');
    });

    it('throws BadRequestException trying to login with wrong password', async () => {
      RejectsInvalidCredentials.setBody({
        email: dumpAdmin.email,
        password: dumpAdmin.password + '123',
      }).test('/auth/login');
    });

    it('throws BadRequestException trying to login without required fields', async () => {
      return new RequestRejectTest(app, 400, 'post', 'email must be an email')
        .setBody({ password: '12345678sdf' })
        .test('/auth/login');
    });
  });

  describe('LOGOUT', () => {
    it('handles logout request', async () => {
      return postResolver(app, jwt).test('/auth/logout', (res) => {});
    });
  });
});

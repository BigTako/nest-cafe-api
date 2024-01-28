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
import { postResolver } from './request-testers';
import { CryptoService } from '../src/users/crypto.service';

let RejectsInvalidCredentials: RequestRejectTest;
let user: User;
let passwordResetToken: string;

describe('Authentication testing (e2e)', () => {
  let app: INestApplication;
  let userService: UsersService;
  let cryptoService: CryptoService;
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

    user = await userService.create(dumpAdmin as User);
    cryptoService = app.get<CryptoService>(CryptoService);

    passwordResetToken = await cryptoService.createPasswordResetToken(user);
    await userService.update(user.id, user);

    await userService.create(dumpNotActivatedUser as User);

    await userService.create(dumpDeletedUser as User);

    RejectsInvalidCredentials = new RequestRejectTest(
      app,
      400,
      'get',
      'Incorrect email or password',
    );
  });

  describe('Sign Up', () => {
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

  describe('Log In', () => {
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
          user = res.body.user;
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

  describe('Log Out', () => {
    it('handles logout request', async () => {
      return postResolver(app, jwt).test('/auth/logout', (res) => {});
    });
  });

  describe('Forgot Password', () => {
    it('throws BadRequestException trying to reset password(forgot password) with invalid email', async () => {
      return new RequestRejectTest(
        app,
        404,
        'post',
        'No user with that email exists',
      )
        .setBody({
          name: 'van2',
          email: 'vangmail.com',
          password: '12345678',
          passwordConfirm: '12345678',
        })
        .test('/auth/forgotPassword');
    });
  });

  describe('Reset Password', () => {
    it('throws BadRequestException trying to reset password with invalid token', async () => {
      return new RequestRejectTest(
        app,
        400,
        'patch',
        'Token is invalid or has expired',
      )
        .setBody({
          password: '123456789',
          passwordConfirm: '123456789',
        })
        .test('/auth/resetPassword/1234567890');
    });

    it('throws BadRequestException trying to reset password with invalid body', async () => {
      return new RequestRejectTest(
        app,
        400,
        'patch',
        'password must be a string',
      )
        .setBody({
          passwordConfirm: '123456789',
        })
        .test(`/auth/resetPassword/${passwordResetToken}`);
    });

    it('throws BadRequestException trying to reset password with invalid password', async () => {
      return new RequestRejectTest(
        app,
        400,
        'patch',
        'password must be longer than or equal to 8 characters',
      )
        .setBody({
          password: '1234567',
          passwordConfirm: '1234567',
        })
        .test(`/auth/resetPassword/${passwordResetToken}`);
    });
  });
});

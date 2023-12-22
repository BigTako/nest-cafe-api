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
  });

  describe('SIGNUP', () => {
    it('throws an error when trying to signup with email which is in use', async () => {
      return await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: dumpAdmin.name,
          email: dumpAdmin.email,
          password: dumpAdmin.password,
          passwordConfirm: dumpAdmin.passwordConfirm,
        })
        .expect(400);
    });

    it('throws an error when trying to signup with invalid email', async () => {
      return await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: 'van2',
          email: 'vangmail.com',
          password: '12345678',
          passwordConfirm: '12345678',
        })
        .expect(400)
        .then((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.message).toContain('email must be an email');
        });
    });

    it('throws an error when trying to signup with invalid password confirm', async () => {
      return await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: dumpAdmin.name,
          email: dumpAdmin.email,
          password: dumpAdmin.password,
          passwordConfirm: dumpAdmin.password + '12345sdfsdf678',
        })
        .expect(400);
    });

    it('throws an error when trying to signup without required fields', async () => {
      return await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: dumpAdmin.email,
          password: dumpAdmin.password,
          passwordConfirm: dumpAdmin.passwordConfirm,
        })
        .expect(400);
    });
  });

  describe('LOGIN', () => {
    it('throws an error when trying to login to unactivated account', async () => {
      return await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: dumpNotActivatedUser.email,
          password: dumpNotActivatedUser.password,
        })
        .expect(400)
        .then((res) =>
          expect(res.body.message).toContain('Incorrect email or password'),
        );
    });

    it('throws an error when trying to login to deactivated account', async () => {
      return await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: dumpDeletedUser.email,
          password: dumpDeletedUser.password,
        })
        .expect(400)
        .then((res) =>
          expect(res.body.message).toContain('Incorrect email or password'),
        );
    });

    it('handles login with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: dumpAdmin.email, password: dumpAdmin.password })
        .expect(201);

      expect(res.body).toBeDefined();
      expect(res.body.jwt).toBeDefined();
      expect(res.body.user).toBeDefined();
      jwt = res.body.jwt;
    });

    it('throws BadRequestException trying to login to unexisting account', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'van123@gmail.com', password: '12345678' })
        .expect(400)
        .then((res) =>
          expect(res.body.message).toContain('Incorrect email or password'),
        );
    });

    it('throws BadRequestException trying to login with wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: dumpAdmin.email, password: dumpAdmin.password + '123' })
        .expect(400);
    });

    it('throws BadRequestException trying to login without required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ password: '12345678sdf' })
        .expect(400);
    });
  });

  describe('LOGOUT', () => {
    it('handles logout request', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${jwt}`)
        .expect(201);
    });
  });
});

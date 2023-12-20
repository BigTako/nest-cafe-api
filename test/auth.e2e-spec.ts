import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/users/user.entity';

describe('Authentication testing (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    const dataSource = app.get(DataSource);
    await dataSource.createQueryBuilder().delete().from(User).execute();
  });

  let jwt: string;

  const dumpName = 'alex';
  const dumpEmail = 'libert761@gmail.com';
  const dumpPassword = '12345678';

  it('handles a signup request with right credentials', async () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .expect(201)
      .send({
        name: dumpName,
        email: dumpEmail,
        password: dumpPassword,
        passwordConfirm: dumpPassword,
      })
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.jwt).toBeDefined();
        expect(res.body.user).toBeDefined();
      });
  });

  it('throws an error when trying to signup with email which is in use', async () => {
    await request(app.getHttpServer()).post('/auth/signup').send({
      name: dumpName,
      email: dumpEmail,
      password: dumpPassword,
      passwordConfirm: dumpPassword,
    });
    return await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: dumpName,
        email: dumpEmail,
        password: dumpPassword,
        passwordConfirm: dumpPassword,
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
      .expect(400);
  });

  it('throws an error when trying to signup with invalid password confirm', async () => {
    return await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'van2',
        email: 'van2@gmail.com',
        password: '12345678',
        passwordConfirm: '12345sdfsdf678',
      })
      .expect(400);
  });

  it('throws an error when trying to signup without required fields', async () => {
    return await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'van2@gmail.com',
        password: '12345678',
        passwordConfirm: '12345sdfsdf678',
      })
      .expect(400);
  });

  it('handles login with valid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: dumpEmail, password: dumpPassword })
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
      .send({ email: 'van2@gmail.com', password: '12345678sdf' })
      .expect(400);
  });

  it('throws BadRequestException trying to login without required fields', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ password: '12345678sdf' })
      .expect(400);
  });

  it('handles logout request', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${jwt}`)
      .expect(201);
  });
});

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

  it('handles a signup request with right credentials', async () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .expect(201)
      .send({
        name: 'van',
        email: 'van@gmail.com',
        password: '12345678',
        passwordConfirm: '12345678',
      })
      .then((res) => {
        expect(res.body).toBeDefined();
      });
  });

  it('throws an error when trying to signup with email which is in use', async () => {
    await request(app.getHttpServer()).post('/auth/signup').send({
      name: 'van2',
      email: 'van@gmail.com',
      password: '12345678',
      passwordConfirm: '12345678',
    });
    return await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'van',
        email: 'van@gmail.com',
        password: '12345678',
        passwordConfirm: '12345678',
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
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'van@gmail.com', password: '12345678' })
      .expect(201);
  });

  it('throws BadRequestException trying to login to unexisting account', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'van123@gmail.com', password: '12345678' })
      .expect(400);
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
});

import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { Custom } from '../src/customs/custom.entity';

const customsData = [
  {
    name: 'Pepperoni',
    price: 100,
    category: 'pizza',
    compounds: 'tomato sauce, cheese, pepperoni',
  },
  {
    name: 'Cheeseburger',
    price: 40,
    category: 'burger',
    compounds: 'bun, cheese, meat, tomato, cucumber, onion, ketchup, mustard',
  },
  {
    name: 'Coca Cola',
    price: 20,
    category: 'drink',
    compounds: 'coca cola',
  },
];

describe('App runtime testing (e2e)', () => {
  let app: INestApplication;
  let foundedCustoms: Custom[];
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    const dataSource = app.get(DataSource);
    await dataSource.createQueryBuilder().delete().from(Custom).execute();
  });

  it('defines app', async () => {
    expect(app).toBeDefined();
  });

  it('successfully create customs with valid data', async () => {
    const server = app.getHttpServer();
    const promises = customsData.map((customData) =>
      request(server).post('/customs').send(customData).expect(201),
    );

    const responses = await Promise.all(promises);

    responses.forEach((res) => {
      expect(res.body).toBeDefined();
    });
  });

  it('successfully finds all customs without options', async () => {
    const server = app.getHttpServer();
    const response = await request(server).get('/customs').expect(200);

    expect(response.body).toHaveLength(customsData.length);
    const custom = response.body[0];
    expect(typeof custom.id).toBe('number');
    expect(typeof custom.name).toBe('string');
    expect(typeof custom.category).toBe('string');
    expect(typeof custom.compounds).toBe('string');
    foundedCustoms = response.body;
  });

  it('successfully finds all customs filtered by category', async () => {
    const server = app.getHttpServer();
    const response = await request(server)
      .get('/customs')
      .query({ category: 'pizza' })
      .expect(200);

    expect(response.body).toHaveLength(1);
    const custom = response.body[0];
    expect(typeof custom.id).toBe('number');
    expect(typeof custom.name).toBe('string');
    expect(typeof custom.category).toBe('string');
    expect(typeof custom.compounds).toBe('string');
  });

  it('successfully finds all customs filtered by category with limited fieds', async () => {
    const server = app.getHttpServer();
    const response = await request(server)
      .get('/customs')
      .query({ category: 'pizza', fields: 'name,category' })
      .expect(200);

    expect(response.body).toHaveLength(1);
    const custom = response.body[0];
    expect(typeof custom.id).toBe('undefined');
    expect(typeof custom.name).toBe('string');
    expect(typeof custom.category).toBe('string');
    expect(typeof custom.compounds).toBe('undefined');
  });

  it('successfully finds all customs sorted by price asc', async () => {
    const server = app.getHttpServer();
    const response = await request(server)
      .get('/customs')
      .query({ sort: 'price' })
      .expect(200);

    expect(response.body).toHaveLength(customsData.length);
    expect(response.body[0].price).toBeLessThanOrEqual(
      response.body[response.body.length - 1].price,
    );
  });

  it('successfully finds all customs sorted by price desc', async () => {
    const server = app.getHttpServer();
    const response = await request(server)
      .get('/customs')
      .query({ sort: '-price' })
      .expect(200);

    expect(response.body).toHaveLength(customsData.length);
    expect(response.body[0].price).toBeGreaterThanOrEqual(
      response.body[response.body.length - 1].price,
    );
  });

  it('successfully limits number of output documents', async () => {
    const server = app.getHttpServer();
    const response = await request(server)
      .get('/customs')
      .query({ limit: 1 })
      .expect(200);

    expect(response.body).toHaveLength(1);
  });

  it('throws BadRequestException trying to create custom with invalid body', async () => {
    const server = app.getHttpServer();
    const response = await request(server)
      .post('/customs')
      .send({ name: 'Pepperoni', price: '100', category: 'pizza' })
      .expect(400);

    expect(response.body).toBeDefined();
    expect(response.body.message).toBeDefined();
    expect(response.body.message).toContain(
      'price must be a number conforming to the specified constraints',
    );
  });

  it('throws NotFoundException trying to find custom by invalid id', async () => {
    const server = app.getHttpServer();
    const response = await request(server).get('/customs/999').expect(404);

    expect(response.body).toBeDefined();
    expect(response.body.message).toBeDefined();
    expect(response.body.message).toContain('Document not found');
  });

  it('throws BadRequestException trying to update custom with invalid body', async () => {
    const server = app.getHttpServer();
    const response = await request(server)
      .patch(`/customs/${foundedCustoms[0].id}`)
      .send({ price: '100' })
      .expect(400);

    expect(response.body).toBeDefined();
    expect(response.body.message).toBeDefined();
    expect(response.body.message).toContain(
      'price must be a number conforming to the specified constraints',
    );
  });

  it('should update custom with valid body', async () => {
    const server = app.getHttpServer();
    const response = await request(server)
      .patch(`/customs/${foundedCustoms[0].id}`)
      .send({ price: 200 })
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.price).toBe(200);
  });

  it('should delete custom', async () => {
    const server = app.getHttpServer();
    const response = await request(server)
      .delete(`/customs/${foundedCustoms[0].id}`)
      .expect(200);

    expect(response.body).toBeDefined();
  });
});

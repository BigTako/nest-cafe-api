import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AuthService } from '../src/auth/auth.service';
import { Custom } from '../src/customs/custom.entity';
import { Order } from '../src/orders/order.entity';
import { OrdersService } from '../src/orders/orders.service';
import { User } from '../src/users/user.entity';
import { UsersService } from '../src/users/users.service';
import {
  RequestRejectTest,
  RequestResolveTest,
} from '../src/utils/request-testing-utils';
import { AppModule } from './../src/app.module';
import { customsData, isICustom } from './customs-test-data';
import { orders } from './orders-test-data';
import {
  deleteResolver,
  getResolver,
  patchResolver,
  postResolver,
} from './request-testers';
import { dumpAdmin, dumpUser, isIUser } from './users-test-data';

describe('Admin flow testing (e2e)', () => {
  let app: INestApplication;
  let userService: UsersService;
  let authService: AuthService;
  let orderService: OrdersService;
  let configService: ConfigService;

  let foundedCustoms: Custom[];
  let foundedUsers: User[];
  let foundedOrders: Order[];

  let jwt: string;

  let RejectsPasswordUpdate: RequestRejectTest;
  let RejectsIncorrectCurrentPassword: RequestRejectTest;
  let RejectsWrongFieldFormat: RequestRejectTest;
  let RejectsNotFound: RequestRejectTest;

  let ResolvesFind: RequestResolveTest;
  let ResolvesCreate: RequestResolveTest;
  let ResolvesUpdate: RequestResolveTest;
  let ResolvesDelete: RequestResolveTest;

  const user: User = dumpAdmin as User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // clean test database
    const dataSource = app.get(DataSource);
    await dataSource.createQueryBuilder().delete().from(Custom).execute();
    await dataSource.createQueryBuilder().delete().from(User).execute();
    await dataSource.createQueryBuilder().delete().from(Order).execute();

    configService = app.get<ConfigService>(ConfigService);
    userService = app.get<UsersService>(UsersService);
    authService = app.get<AuthService>(AuthService);
    orderService = app.get<OrdersService>(OrdersService);

    await userService.create(user);
  });

  it('defines app', async () => {
    expect(app).toBeDefined();
  });

  describe('Authentication', () => {
    it('handles admin login', async () => {
      const { jwt: token, user: admin } = await authService.login(
        user.email,
        user.password,
      );
      jwt = token;
      expect(jwt).toBeDefined();
      expect(admin).toBeDefined();
      expect(admin.role).toBe('admin');
      user.id = admin.id;

      RejectsWrongFieldFormat = new RequestRejectTest(
        app,
        400,
        'post',
        'price must be a number conforming to the specified constraints',
      ).setJWT(jwt);

      RejectsIncorrectCurrentPassword = new RequestRejectTest(
        app,
        400,
        'patch',
        configService.get('errorMessages.INCORRECT_CURRENT_PASSWORD'),
      ).setJWT(jwt);

      RejectsPasswordUpdate = new RequestRejectTest(
        app,
        403,
        'patch',
        configService.get('errorMessages.PASSWORD_UPDATE_FORBIDDEN'),
      ).setJWT(jwt);

      RejectsNotFound = new RequestRejectTest(
        app,
        404,
        'get',
        configService.get('errorMessages.DOCUMENT_NOT_FOUND'),
      ).setJWT(jwt);

      ResolvesFind = getResolver(app, jwt);
      ResolvesCreate = postResolver(app, jwt);
      ResolvesUpdate = patchResolver(app, jwt);
      ResolvesDelete = deleteResolver(app, jwt);
    });
  });

  describe('Admin Interraction with customs', () => {
    it('successfully create customs with valid data', async () => {
      const server = app.getHttpServer();
      const promises = customsData.map((customData) =>
        request(server)
          .post('/customs')
          .set('Authorization', `Bearer ${jwt}`)
          .send(customData)
          .expect(201),
      );

      const responses = await Promise.all(promises);

      responses.forEach((res) => {
        expect(res.body).toBeDefined();
        expect(isICustom(res.body)).toBe(true);
      });
    });

    it('finds all customs without options', async () => {
      return ResolvesFind.test('/customs', (res) => {
        expect(res.body).toHaveLength(customsData.length);
        expect(res.body.every(isICustom)).toBe(true);
        foundedCustoms = res.body;
      });
    });

    it('throws BadRequestException trying to create custom with invalid body', async () => {
      return RejectsWrongFieldFormat.setBody({
        name: 'Pepperoni',
        price: '100',
        category: 'pizza',
      }).test('/customs');
    });

    it('throws NotFoundException trying to find custom by invalid id', async () => {
      return RejectsNotFound.test('/customs/999');
    });

    it('throws BadRequestException trying to update custom with invalid body', async () => {
      return RejectsWrongFieldFormat.setMethod('patch')
        .setBody({ price: '100' })
        .test(`/customs/${foundedCustoms[0].id}`);
    });

    it('updates custom with valid body', async () => {
      return ResolvesUpdate.setBody({ price: 200 }).test(
        `/customs/${foundedCustoms[0].id}`,
        (res) => {
          expect(res.body).toBeDefined();
          expect(res.body.price).toBe(200);
        },
      );
    });

    it('deletes custom', async () => {
      return ResolvesDelete.test(`/customs/${foundedCustoms[0].id}`, (res) => {
        expect(res.body).toBeDefined();
        foundedCustoms.shift();
      });
    });
  });

  describe('Admin Interraction with users', () => {
    let examinee: User;

    it('successfully creates user', async () => {
      return ResolvesCreate.setBody(dumpUser).test('/users', (res) => {
        expect(res.body).toBeDefined();
        expect(isIUser(res.body)).toBe(true);
      });
    });

    it('finds all users without options', async () => {
      return ResolvesFind.test('/users', (res) => {
        foundedUsers = res.body;
        examinee = foundedUsers.find((user) => user.email !== dumpAdmin.email);
        expect(res.body).toHaveLength(2);
        expect(res.body[0].email).toBe(user.email);
      });
    });

    it('successfully finds user by id', async () => {
      return ResolvesFind.test(`/users/${examinee.id}`, (res) => {
        expect(res.body).toBeDefined();
        expect(isIUser(res.body)).toBe(true);
        expect(res.body.email).toBe(examinee.email);
      });
    });

    it('throws NotFound trying to find unexisting user', async () => {
      return RejectsNotFound.setMethod('get').test('/users/999');
    });

    it('successfully updates user by id', async () => {
      return ResolvesUpdate.setBody({ name: 'Alex' }).test(
        `/users/${examinee.id}`,
        (res) => {
          expect(res.body).toBeDefined();
          expect(res.body.name).toBe('Alex');
        },
      );
    });

    it('successfully deletes user by id', async () => {
      return ResolvesDelete.test(`/users/${examinee.id}`, (res) => {
        expect(res.body).toBeDefined();
      });
    });
  });

  describe('Admin interraction with orders', () => {
    it('creates an orders', async () => {
      const promises = orders.map((order) =>
        request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${jwt}`)
          .send({ ...order, customs: [foundedCustoms[0].id] })
          .expect(201),
      );

      const responses = await Promise.all(promises);
      foundedOrders = responses.map((res) => res.body);
    });

    it('throws NotFoundException trying to create order with not existing custom', async () => {
      return RejectsNotFound.setMethod('post')
        .setMessage('Custom with id 999 not found')
        .setBody({
          customs: [999],
        })
        .test('/orders');
    });

    it('finds all orders without options', async () => {
      return ResolvesFind.test('/orders', (res) => {
        foundedOrders = res.body;
        expect(res.body).toHaveLength(foundedOrders.length);
        expect(res.body[0].customs).toHaveLength(
          foundedOrders[0].customs.length,
        );
      });
    });

    it('finds order by id', async () => {
      return ResolvesFind.test(`/orders/${foundedOrders[0].id}`, (res) => {
        expect(res.body).toBeDefined();
        expect(res.body.customs).toHaveLength(1);
      });
    });

    it('updates order by id', async () => {
      return ResolvesUpdate.setBody({
        customs: [foundedCustoms[1].id],
      }).test(`/orders/${foundedOrders[0].id}`, (res) => {
        expect(res.body).toBeDefined();
        expect(res.body.customs).toHaveLength(1);
        expect(res.body.customs[0].id).toBe(foundedCustoms[1].id);
      });
    });

    it('deletes order by id', async () => {
      return ResolvesDelete.test(`/orders/${foundedOrders[0].id}`, (res) => {
        expect(res.body).toBeDefined();
        foundedCustoms.shift();
      });
    });
  });

  describe('Admin interraction with top ordered customs', () => {
    it('gets top ordered customs', async () => {
      return ResolvesFind.test('/customs/topOrdered', (res) => {
        expect(res.body).toBeDefined();
        expect(res.body).toHaveLength(foundedCustoms.length);
      });
    });

    it('gets top ordered customs of current user', async () => {
      return ResolvesFind.test('/customs/topOrdered/me', (res) => {
        expect(res.body).toBeDefined();
        expect(res.body).toHaveLength(1);
      });
    });

    it('gets top ordered customs of user by id', async () => {
      return ResolvesFind.test(
        `/customs/topOrdered/${foundedUsers[0].id}`,
        (res) => {
          expect(res.body).toBeDefined();
          expect(res.body).toHaveLength(1); // two orders for same custom
        },
      );
    });

    it('throws NotFoundException trying to get top ordered customs of user by invalid id', async () => {
      return RejectsNotFound.setMethod('get')
        .setMessage('User not found')
        .test('/customs/topOrdered/999');
    });
  });

  describe('Admin interraction with own account', () => {
    it('gets current user info', async () => {
      return ResolvesFind.test('/users/me', (res) => {
        expect(res.body).toBeDefined();
        expect(isIUser(res.body)).toBe(true);
        expect(res.body.email).toBe(user.email);
      });
    });

    it('updates current user info', async () => {
      return ResolvesUpdate.setBody({ name: 'Sasha' }).test(
        '/users/me',
        (res) => {
          expect(res.body).toBeDefined();
          expect(res.body.name).toBe('Sasha');
        },
      );
    });

    it('throws ForbiddenException trying to update password with user info', async () => {
      return RejectsPasswordUpdate.setBody({
        name: 'Alex',
        password: '123456789',
      }).test('/users/me');
    });

    it('updates current user password', async () => {
      return ResolvesUpdate.setBody({
        passwordCurrent: dumpAdmin.password,
        password: '123456789',
        passwordConfirm: '123456789',
      }).test('/users/me/updatePassword', (res) => {
        expect(res.body).toBeDefined();
        expect(res.body.name).toBe('Sasha');
        dumpAdmin.password = '123456789';
        dumpAdmin.passwordConfirm = '123456789';
      });
    });

    it('throws BadRequestException trying to update current user password with wrong current password', async () => {
      return RejectsIncorrectCurrentPassword.setBody({
        passwordCurrent: user.password + '123',
        password: '123456789',
        passwordConfirm: '123456789',
      }).test('/users/me/updatePassword');
    });

    it('deactivates current user', async () => {
      return ResolvesDelete.test('/users/me', (res) => {
        expect(res.body).toBeDefined();
      });
    });
  });
});

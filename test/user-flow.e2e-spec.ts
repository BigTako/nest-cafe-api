import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AuthService } from '../src/auth/auth.service';
import { Custom } from '../src/customs/custom.entity';
import { CustomsService } from '../src/customs/customs.service';
import { User } from '../src/users/user.entity';
import { UsersService } from '../src/users/users.service';

import { AppModule } from './../src/app.module';
import { customsData, isICustom } from './customs-test-data';
import { dumpUser, isIUser } from './users-test-data';
import {
  RequestRejectTest,
  RequestResolveTest,
} from '../src/utils/request-testing-utils';
import {
  deleteResolver,
  getResolver,
  patchResolver,
  postResolver,
} from './request-testers';
import { Order } from '../src/orders/order.entity';
import { ConfigService } from '@nestjs/config';

describe('App runtime testing (e2e)', () => {
  let app: INestApplication;
  let userService: UsersService;
  let authService: AuthService;
  let customService: CustomsService;
  let configService: ConfigService;

  let foundedCustoms: Custom[];
  let foundedOrders: Order[];

  let jwt: string;
  let user: User = dumpUser as User;

  let RejectsForbidden: RequestRejectTest;
  let RejectsNotFound: RequestRejectTest;
  let RejectsPasswordUpdate: RequestRejectTest;
  let RejectsIncorrectCurrentPassword: RequestRejectTest;
  let RejectsWrongFieldFormat: RequestRejectTest;

  let ResolvesFind: RequestResolveTest;
  let ResolvesUpdate: RequestResolveTest;
  let ResolvesCreate: RequestResolveTest;
  let ResolvesDelete: RequestResolveTest;

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

    userService = app.get<UsersService>(UsersService);
    authService = app.get<AuthService>(AuthService);
    customService = app.get<CustomsService>(CustomsService);
    configService = app.get<ConfigService>(ConfigService);

    await userService.create(user);

    const initCustoms = customsData.map((custom) =>
      customService.create(custom as Custom),
    );

    await Promise.all(initCustoms);
  });

  it('defines app', async () => {
    expect(app).toBeDefined();
  });

  describe('Authentication', () => {
    it('handles admin login', async () => {
      const { jwt: token, user: client } = await authService.login(
        user.email,
        user.password,
      );
      jwt = token;
      user.id = client.id;
      expect(client).toBeDefined();
      expect(jwt).toBeDefined();
      expect(client.role).toBe('user');

      RejectsForbidden = new RequestRejectTest(
        app,
        403,
        'get',
        configService.get('errorMessages.ACCESS_FORBIDDEN'),
      ).setJWT(jwt);

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

  describe('Authenticated user interraction with customs', () => {
    it('successfully finds all customs without options', async () => {
      return ResolvesFind.test('/customs', (res) => {
        expect(res.body).toHaveLength(customsData.length);
        expect(res.body.every(isICustom)).toBe(true);
        foundedCustoms = res.body;
      });
    });

    it('throws ForbiddenException trying to create custom', async () => {
      return RejectsForbidden.setBody(customsData[0])
        .setMethod('post')
        .test('/customs');
    });

    it('throws ForbiddenException trying to update custom', async () => {
      return await RejectsForbidden.setMethod('post').test('/customs');
    });

    it('throws ForbiddenException trying to delete custom', async () => {
      return await RejectsForbidden.setMethod('delete').test(
        `/customs/${foundedCustoms[0].id}`,
      );
    });
  });

  describe('Authenticated user interraction with own orders', () => {
    it('creates a new order', async () => {
      return ResolvesCreate.setBody({ customs: [foundedCustoms[0].id] }).test(
        '/orders',
        (res) => {
          expect(res.body).toBeDefined();
          expect(res.body).toHaveProperty('id');
        },
      );
    });

    it('throws NotFoundException thying to create an order with nonexistent custom', async () => {
      return RejectsNotFound.setMethod('post')
        .setMessage('Custom with id 999 not found')
        .setBody({
          customs: [999],
        })
        .test('/orders');
    });

    it('throws BadRequestException trying to create an order with 0 customs specified', async () => {
      return RejectsWrongFieldFormat.setMethod('post')
        .setMessage('customs must contain at least 1 elements')
        .setBody({
          customs: [],
        })
        .test('/orders');
    });

    it('gets all current user orders', async () => {
      return ResolvesFind.test('/orders/me', (res) => {
        expect(res.body).toBeDefined();
        expect(res.body).toHaveLength(1);
        const order = res.body[0];
        expect(order.customs).toBeDefined();
        expect(order.customs).toHaveLength(1);
        expect(isIUser(order.user)).toBeTruthy();
        expect(order.user.email).toBe(user.email);
        expect(isICustom(order.customs[0])).toBeTruthy();
        foundedOrders = res.body;
      });
    });

    it('gets order by id', async () => {
      return ResolvesFind.test(`/orders/me/${foundedOrders[0].id}`, (res) => {
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('id');
      });
    });

    it('updates order', async () => {
      return ResolvesUpdate.setBody({
        customs: [foundedCustoms[1].id],
      }).test(`/orders/me/${foundedOrders[0].id}`, (res) => {
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('id');
        expect(res.body.customs).toHaveLength(1);
      });
    });

    it('deletes order by id', async () => {
      return ResolvesDelete.test(`/orders/me/${foundedOrders[0].id}`, (res) => {
        expect(res.body).toBeDefined();
      });
    });
  });

  describe('Authenticated user iterraction with top ordered customs', () => {
    it('gets top ordered customs', async () => {
      return ResolvesFind.test('/customs/topOrdered', (res) => {
        expect(res.body).toBeDefined();
        expect(res.body).toHaveLength(0);
      });
    });

    it('gets top ordered customs of current user', async () => {
      return ResolvesFind.test('/customs/topOrdered/me', (res) => {
        expect(res.body).toBeDefined();
        expect(res.body).toHaveLength(0);
      });
    });

    it('throws Forbidden trying to get top ordered customs by user id', async () => {
      return RejectsForbidden.setMethod('get').test('/customs/topOrdered/1');
    });
  });

  describe('Authenticated user interraction with all orders', () => {
    it('throws Forbidden trying to find all orders', async () => {
      return RejectsForbidden.setMethod('get').test('/orders');
    });

    it('throws Forbidden trying to find order by id', async () => {
      return RejectsForbidden.test(`/orders/${123}`);
    });

    it('throws Forbidden trying to update order by id', async () => {
      return RejectsForbidden.setMethod('patch')
        .setBody({ customs: [foundedCustoms[0].id] })
        .test(`/orders/${foundedOrders[0].id}`);
    });

    it('throws Forbidden trying to delete order by id', async () => {
      return RejectsForbidden.setMethod('delete').test(
        `/orders/${foundedOrders[0].id}`,
      );
    });
  });

  describe('Authenticated user interraction with users', () => {
    it('throws Forbidden trying to find all users without options', async () => {
      return RejectsForbidden.setMethod('get').test('/users');
    });

    it('throws Forbidden trying to find user by id', async () => {
      return RejectsForbidden.test(`/users/${user.id}`);
    });

    it('throws Forbidden trying to create a user', async () => {
      return RejectsForbidden.setBody(dumpUser)
        .setMethod('post')
        .test('/users');
    });

    it('throws Forbidden trying to update user by id', async () => {
      return RejectsForbidden.setMethod('patch')
        .setBody({ name: 'Alex' })
        .test(`/users/${user.id}`);
    });

    it('throws Forbidden trying to delete user by id', async () => {
      return RejectsForbidden.setMethod('delete').test(`/users/${user.id}`);
    });
  });

  describe('Authenticated user interraction with own account', () => {
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
          user.name = 'Sasha';
        },
      );
    });

    it('throws  trying to update password with user info', async () => {
      return RejectsPasswordUpdate.setBody({
        name: 'Alex',
        password: '123456789',
      }).test('/users/me');
    });

    it('updates current user password', async () => {
      return ResolvesUpdate.setBody({
        passwordCurrent: user.password,
        password: '123456789',
        passwordConfirm: '123456789',
      }).test('/users/me/updatePassword', (res) => {
        expect(res.body).toBeDefined();
        expect(res.body.name).toBe('Sasha');
        user.password = '123456789';
        user.passwordConfirm = '123456789';
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
      return ResolvesDelete.setMethod('delete').test('/users/me', (res) => {
        expect(res.body).toBeDefined();
      });
    });
  });
});

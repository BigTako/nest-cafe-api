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
  absentRequiredFieldRejector,
  deleteResolver,
  forbiddenRejector,
  getResolver,
  incorrectCurrentPasswordRejector,
  notFoundRejector,
  passwordUpdateRejector,
  patchResolver,
  postResolver,
} from './request-testers';
import { Order } from '../src/orders/order.entity';

describe('App runtime testing (e2e)', () => {
  let app: INestApplication;
  let userService: UsersService;
  let authService: AuthService;
  let customService: CustomsService;

  let foundedCustoms: Custom[];
  let foundedOrders: Order[];

  let jwt: string;
  let user: User = dumpUser as User;

  let RejectsForbidden: RequestRejectTest;
  let RejectsNotFound: RequestRejectTest;
  let RejectsPasswordChanging: RequestRejectTest;
  let RejectIncorrectCurrentPassword: RequestRejectTest;
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
      RejectsForbidden = forbiddenRejector(app, jwt);

      RejectsPasswordChanging = passwordUpdateRejector(app, jwt);

      RejectIncorrectCurrentPassword = incorrectCurrentPasswordRejector(
        app,
        jwt,
      );

      RejectsWrongFieldFormat = absentRequiredFieldRejector(
        app,
        jwt,
        'price must be a number conforming to the specified constraints',
      );

      RejectsNotFound = notFoundRejector(app, jwt);

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
      return RejectsPasswordChanging.setBody({
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
      return RejectIncorrectCurrentPassword.setBody({
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

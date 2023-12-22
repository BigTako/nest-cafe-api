import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { Custom } from '../src/customs/custom.entity';
import { UsersService } from '../src/users/users.service';
import { AuthService } from '../src/auth/auth.service';
import { User } from '../src/users/user.entity';
import { customsData, isICustom } from './customs-test-data';
import { dumpAdmin, dumpUser, isIUser } from './users-test-data';
import {
  RequestRejectTest,
  RequestResolveTest,
} from '../src/utils/request-testing-utils';
import {
  absentRequiredFieldRejector,
  deleteResolver,
  getResolver,
  incorrectCurrentPasswordRejector,
  notFoundRejector,
  passwordUpdateRejector,
  patchResolver,
  postResolver,
} from './request-testers';

const UserCRUDTests = (app: any) => {
  it('defines app', async () => {
    expect(app).toBeDefined();
  });

  // Add other common tests as needed
};

describe('Admin flow testing (e2e)', () => {
  let app: INestApplication;
  let userService: UsersService;
  let authService: AuthService;

  let foundedCustoms: Custom[];
  let foundedUsers: User[];

  let jwt: string;

  let RejectsPasswordChanging: RequestRejectTest;
  let RejectsIncorrectCurrentPassword: RequestRejectTest;
  let RejectsAbsentPrice: RequestRejectTest;
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

    userService = app.get<UsersService>(UsersService);
    authService = app.get<AuthService>(AuthService);

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

      RejectsIncorrectCurrentPassword = incorrectCurrentPasswordRejector(
        app,
        jwt,
      );

      RejectsPasswordChanging = passwordUpdateRejector(app, jwt);

      RejectsAbsentPrice = absentRequiredFieldRejector(
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
      return RejectsAbsentPrice.setBody({
        name: 'Pepperoni',
        price: '100',
        category: 'pizza',
      }).test('/customs');
    });

    it('throws NotFoundException trying to find custom by invalid id', async () => {
      return RejectsNotFound.test('/customs/999');
    });

    it('throws BadRequestException trying to update custom with invalid body', async () => {
      return RejectsAbsentPrice.setMethod('patch')
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

    it('should delete custom', async () => {
      return ResolvesDelete.test(`/customs/${foundedCustoms[0].id}`, (res) => {
        expect(res.body).toBeDefined();
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

  describe('User interraction with own account', () => {
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
      return RejectsPasswordChanging.setBody({
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

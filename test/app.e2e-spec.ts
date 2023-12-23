import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { Custom } from '../src/customs/custom.entity';
import { User } from '../src/users/user.entity';
import { CustomsService } from '../src/customs/customs.service';
import { customsData, isICustom } from './customs-test-data';
import {
  RequestRejectTest,
  RequestResolveTest,
} from '../src/utils/request-testing-utils';
import {
  getResolver,
  notFoundRejector,
  unauthorizedRejector,
} from './request-testers';

class Rejector {
  constructor(
    private exceptionHandler: RequestRejectTest,
    private entity: string,
  ) {}

  rejectsGetAll() {
    it(`throws Unauthorized trying to get all ${this.entity}`, async () => {
      return this.exceptionHandler.setMethod('get').test(`/${this.entity}`);
    });
    return this;
  }

  rejectsGetOne(id: string) {
    it(`throws Unauthorized trying to get ${this.entity} by id`, async () => {
      return this.exceptionHandler
        .setMethod('get')
        .test(`/${this.entity}/${id}`);
    });
    return this;
  }

  rejectsCreate() {
    it(`throws Unauthorized trying to create ${this.entity}`, async () => {
      return this.exceptionHandler.setMethod('post').test(`/${this.entity}`);
    });
    return this;
  }
}

describe('App runtime testing (e2e)', () => {
  let app: INestApplication;
  let customService: CustomsService;
  let foundedCustoms: Custom[] = [];

  let RejectsUnauthorized: RequestRejectTest;
  let RejectsNotFound: RequestRejectTest;
  let ResolvesFind: RequestResolveTest;

  let UnauthorizedUserRejector: Rejector;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    RejectsUnauthorized = unauthorizedRejector(app, '');
    RejectsNotFound = notFoundRejector(app, '');
    ResolvesFind = getResolver(app, '');

    UnauthorizedUserRejector = new Rejector(RejectsUnauthorized, 'users');

    const dataSource = app.get(DataSource);
    await dataSource.createQueryBuilder().delete().from(Custom).execute();
    await dataSource.createQueryBuilder().delete().from(User).execute();

    customService = app.get<CustomsService>(CustomsService);

    const initCustoms = customsData.map((custom) =>
      customService.create(custom as Custom),
    );
    await Promise.all(initCustoms);
  });

  afterAll(async () => {
    await app.close();
  });

  it('defines app', async () => {
    expect(app).toBeDefined();
  });

  describe('Unauthenticated guest interraction with customs', () => {
    it('successfully finds all customs without options', async () => {
      return ResolvesFind.test('/customs', (res) => {
        expect(res.body).toHaveLength(customsData.length);
        expect(res.body.every(isICustom)).toBe(true);
        foundedCustoms = res.body;
      });
    });

    it('successfully finds custom by id', async () => {
      return ResolvesFind.test(`/customs/${foundedCustoms[0].id}`, (res) => {
        expect(res.body).toBeDefined();
        expect(isICustom(res.body)).toBe(true);
      });
    });

    it('throws NotFoundException trying to find custom by invalid id', async () => {
      return await RejectsNotFound.test('/customs/999');
    });

    it('successfully finds all customs filtered by category', async () => {
      return ResolvesFind.setQuery({ category: 'pizza' }).test(
        '/customs',
        (res) => {
          expect(res.body).toHaveLength(1);
          expect(isICustom(res.body[0])).toBe(true);
        },
      );
    });

    it('successfully finds all customs filtered by category with limited fieds', async () => {
      return ResolvesFind.setQuery({
        category: 'pizza',
        fields: 'name,category',
      }).test('/customs', (res) => {
        expect(res.body).toHaveLength(1);
        const custom = res.body[0];
        expect(custom.name).toBeDefined();
        expect(custom.category).toBeDefined();
        expect(custom.price).not.toBeDefined();
      });
    });

    it('successfully finds all customs sorted by price asc', async () => {
      return ResolvesFind.setQuery({ sort: 'price' }).test(
        '/customs',
        (res) => {
          expect(res.body).toHaveLength(customsData.length);
          expect(res.body[0].price).toBeLessThanOrEqual(
            res.body[res.body.length - 1].price,
          );
        },
      );
    });

    it('successfully finds all customs sorted by price desc', async () => {
      return ResolvesFind.setQuery({ sort: '-price' }).test(
        '/customs',
        (res) => {
          expect(res.body).toHaveLength(customsData.length);
          expect(res.body[0].price).toBeGreaterThanOrEqual(
            res.body[res.body.length - 1].price,
          );
        },
      );
    });

    it('successfully limits number of output documents', async () => {
      return ResolvesFind.setQuery({ limit: 1 }).test('/customs', (res) => {
        expect(res.body).toHaveLength(1);
      });
    });

    it('throws Unathorized trying to create custom', async () => {
      return RejectsUnauthorized.setMethod('post').test('/customs');
    });

    it('throws Unathorized trying to update custom', async () => {
      return RejectsUnauthorized.setMethod('patch').test(
        `/customs/${foundedCustoms[0].id}`,
      );
    });

    it('throws Unathorized trying to delete custom', async () => {
      return RejectsUnauthorized.setMethod('delete').test(
        `/customs/${foundedCustoms[0].id}`,
      );
    });
  });

  // describe('Unauthenticated guest interraction with users', () => {
  //   it('throws Uauthorized trying to create a user', async () => {
  //     return RejectsUnauthorized.setMethod('post').test('/users');
  //   });

  //   it('throws Uauthorized trying to find all users without options', async () => {
  //     return RejectsUnauthorized.setMethod('get').test('/users');
  //   });

  //   it('throws Uauthorized trying to find user by id', async () => {
  //     return RejectsUnauthorized.setMethod('get').test('/users/users/123');
  //   });

  //   it('throws Uauthorized trying to update user by id', async () => {
  //     return RejectsUnauthorized.setMethod('patch').test('/users/users/123');
  //   });

  //   it('throws Uauthorized trying to delete user by id', async () => {
  //     return RejectsUnauthorized.setMethod('delete').test('/users/users/123');
  //   });
  // });

  // describe('Unauthenticated guest interraction with orders', () => {
  //   it('throws Uauthorized trying to all orders', async () => {
  //     return RejectsUnauthorized.setMethod('get').test('/orders');
  //   });

  //   it('throws Uauthorized trying get order by id', async () => {
  //     return RejectsUnauthorized.setMethod('get').test('/orders/users/123');
  //   });

  //   it('throws Uauthorized trying to create order', async () => {
  //     return RejectsUnauthorized.setMethod('post').test('/orders');
  //   });

  //   it('throws Uauthorized trying to update order', async () => {
  //     return RejectsUnauthorized.setMethod('patch').test('/orders/users/123');
  //   });

  //   it('throws Uauthorized trying to delete order', async () => {
  //     return RejectsUnauthorized.setMethod('delete').test('/orders/users/123');
  //   });
  // });
  describe('Unauthenticated guest interraction with users', () => {
    it(`throws Unauthorized trying to get all users`, async () => {
      return RejectsUnauthorized.setMethod('get').test(`/users`);
    });

    it(`throws Unauthorized trying to get users by id`, async () => {
      return RejectsUnauthorized.setMethod('get').test(`/users/123`);
    });

    it(`throws Unauthorized trying to create users`, async () => {
      return RejectsUnauthorized.setMethod('post').test(`/users`);
    });

    it(`throws Unauthorized trying to update users`, async () => {
      return RejectsUnauthorized.setMethod('patch').test(`/users/123`);
    });

    it(`throws Unauthorized trying to delete users`, async () => {
      return RejectsUnauthorized.setMethod('delete').test(`/users/123`);
    });

    // testUnauthorizedAccess('orders', 'orders/users/123');
  });

  describe('Unauthenticated guest interraction authorized user orders', () => {
    it('throws Uauthorized trying to all authorized user orders', async () => {
      return RejectsUnauthorized.setMethod('get').test('/orders/me');
    });

    it('throws Uauthorized trying get authorized user order by id', async () => {
      return RejectsUnauthorized.setMethod('get').test('/orders/me/123');
    });

    it('throws Uauthorized trying to update authorized user order', async () => {
      return RejectsUnauthorized.setMethod('patch').test('/orders/me/123');
    });

    it('throws Uauthorized trying to delete order', async () => {
      return RejectsUnauthorized.setMethod('delete').test('/orders/me/123');
    });
  });

  describe('Unauthenticated guest interraction with own account', () => {
    it('throws Uauthorized trying to get current user info', async () => {
      return RejectsUnauthorized.setMethod('get').test('/users/me');
    });

    it('throws Uauthorized trying to update current user info', async () => {
      return RejectsUnauthorized.setMethod('patch').test('/users/me');
    });

    it('throws Uauthorized trying to update current user password', async () => {
      return RejectsUnauthorized.setMethod('patch').test(
        '/users/me/updatePassword',
      );
    });

    it('throws Uauthorized trying to deactivate current user', async () => {
      return RejectsUnauthorized.setMethod('delete').test('/users/me');
    });
  });
});

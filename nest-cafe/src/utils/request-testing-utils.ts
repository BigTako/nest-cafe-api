import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

type ExpectedResponceCallback = (res: request.Response) => void;

abstract class RequestTest {
  protected requestBody: object = {};
  protected requestQuery: object = {};
  protected requestAuthToken: string = '';

  constructor(
    protected app: INestApplication,
    protected status?: number,
    protected method?: string,
  ) {}

  abstract test(
    url: string,
    responceExpect: ExpectedResponceCallback,
  ): Promise<any>;

  public setMethod(method: string) {
    this.method = method;
    return this;
  }

  public setStatus(status: number) {
    this.status = status;
    return this;
  }

  public setJWT(token: string) {
    this.requestAuthToken = token;
    return this;
  }

  public setBody(body: object) {
    this.requestBody = body;
    return this;
  }

  public setQuery(query: object) {
    this.requestQuery = query;
    return this;
  }
}

export class RequestResolveTest extends RequestTest {
  constructor(app: INestApplication, status: number, method: string) {
    super(app, status, method);
  }

  async test(url: string, responceExpect: ExpectedResponceCallback) {
    return await request(this.app.getHttpServer())
      [this.method](url)
      .expect(this.status)
      .set('Authorization', 'Bearer ' + this.requestAuthToken)
      .query(this.requestQuery)
      .send(this.requestBody)
      .then(responceExpect);
  }
}

export class RequestRejectTest extends RequestTest {
  constructor(
    app: INestApplication,
    status: number,
    method: string,
    private message: string,
  ) {
    super(app, status, method);
  }

  async test(url: string) {
    return await request(this.app.getHttpServer())
      [this.method](url)
      .expect(this.status)
      .set('Authorization', 'Bearer ' + this.requestAuthToken)
      .query(this.requestQuery)
      .send(this.requestBody)
      .then((res: request.Response) => {
        expect(res.body).toBeDefined();
        expect(res.body.message).toBeDefined();
        expect(res.body.message).toContain(this.message);
      });
  }

  setMessage(message: string) {
    this.message = message;
    return this;
  }
}

const dbConfig = require('./../ormconfig.js');

import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { CustomsModule } from './customs/customs.module';
import { OrdersModule } from './orders/orders.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

const cookieSession = require('cookie-session');

@Module({
  imports: [
    TypeOrmModule.forRoot(dbConfig),
    UsersModule,
    CustomsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      // create a global validation pipe in app module(each request will catch it)
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: ['development key'], // string is used for encryption
        }),
      )
      .forRoutes('*');
  }
}

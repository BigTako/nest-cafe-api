import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

import * as cookieParser from 'cookie-parser';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { CustomsModule } from './customs/customs.module';
import { OrdersModule } from './orders/orders.module';

import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { AuthModule } from './auth/auth.module';

import databaseConfig from '../config/orm.config';
import emailConfig from '../config/email.config';
import errorMessages from '../config/error-messages.config';
import cacheConfig from '../config/cache.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      load: [databaseConfig, emailConfig, errorMessages, cacheConfig],
      expandVariables: true,
      isGlobal: true,
    }),

    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm'),
      isGlobal: true,
      inject: [ConfigService],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return configService.get('typeorm');
      },
      inject: [ConfigService],
    }),

    UsersModule,
    CustomsModule,
    OrdersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        skipMissingProperties: false,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {
  constructor() {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}

import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { CustomsModule } from './customs/customs.module';
import { OrdersModule } from './orders/orders.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { AuthModule } from './auth/auth.module';
import { EmailService } from './email/email.service';
import * as cookieParser from 'cookie-parser';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [configService.get<string>('DB_ENTITIES')],
          synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
        };
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
      // create a global validation pipe in app module(each request will catch it)
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
    EmailService,
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}

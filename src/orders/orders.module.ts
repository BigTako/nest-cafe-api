import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { CustomsModule } from '../customs/customs.module';
import { MiddlewareBuilder } from '@nestjs/core';
import { OrdersService } from './orders.service';
import { PopulateOrderMiddleware } from './middlewares/popupate-order.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    JwtModule,
    ConfigModule,
    UsersModule,
    CustomsModule,
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PopulateOrderMiddleware)
      .forRoutes(
        { path: '/orders', method: RequestMethod.POST },
        { path: '/orders/:id', method: RequestMethod.PATCH },
      );
  }
}

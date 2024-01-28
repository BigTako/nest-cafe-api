import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { QueryPipe } from '../pipes/query.pipe';
import { FindManyOptions } from 'typeorm';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { Serialize } from '../decorators/serialize.decorator';

import { GetOrderGto } from './dtos/get-order.dto';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { RolesGuard } from '../guards/roles.guard';
import { UpdateCurrentUserOrderDto } from './dtos/update-current-user-order.dto';
import { ConfigService } from '@nestjs/config';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller({
  path: 'orders',
  version: '1',
})
@Serialize(GetOrderGto)
@UseGuards(AuthGuard)
@UseInterceptors(CacheInterceptor)
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private configService: ConfigService,
  ) {}
  @Get()
  @CacheTTL(0)
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  getOrders(@Query(QueryPipe) query: FindManyOptions) {
    return this.ordersService.find(query);
  }

  @Get('me')
  getCurrentUserOrders(
    @CurrentUser() user: User,
    @Query(QueryPipe) query: FindManyOptions,
  ) {
    return this.ordersService.find({
      ...query,
      where: { user: user.id, ...query.where },
    });
  }

  @Get('me/:id')
  async getCurrentUserOrder(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    const [order] = await this.ordersService.find({
      where: { id: +id, user: user.id },
    });
    if (!order) {
      throw new NotFoundException(
        this.configService.get('errorMessages.DOCUMENT_NOT_FOUND'),
      );
    }
    return order;
  }

  @Patch('me/:id')
  async updateCurrentUserOrder(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() data: UpdateCurrentUserOrderDto,
  ) {
    const order = await this.getCurrentUserOrder(id, user);

    return this.ordersService.update(order.id, data);
  }

  @Delete('me/:id')
  async deleteCurrentUserOrder(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    const order = await this.getCurrentUserOrder(id, user);
    return this.ordersService.remove(order.id);
  }

  @CacheTTL(0)
  @Get(':id')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  getOrder(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Post()
  createOrder(@Body() data: CreateOrderDto, @CurrentUser() user: User) {
    return this.ordersService.create({ ...data, user });
  }

  @Patch(':id')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  updateOrder(@Param('id') id: string, @Body() data: UpdateOrderDto) {
    return this.ordersService.update(+id, data);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  deleteOrder(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}

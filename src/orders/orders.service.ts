import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { CustomsService } from '../customs/customs.service';
import { ServiceFactory } from '../factories/service.factory';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrdersService extends ServiceFactory<Order> {
  constructor(
    @InjectRepository(Order) private repo: Repository<Order>,
    private configurationService: ConfigService,
  ) {
    super(repo, configurationService, CreateOrderDto, UpdateOrderDto);
  }
}

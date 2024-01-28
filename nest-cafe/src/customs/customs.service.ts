import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Custom } from './custom.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCustomDto } from './dtos/create-custom.dto';
import { UpdateCustomDto } from './dtos/update-custom.dto';
import { UsersService } from '../users/users.service';
import { ServiceFactory } from '../factories/service.factory';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CustomsService extends ServiceFactory<Custom> {
  constructor(
    @InjectRepository(Custom) private repo: Repository<Custom>,
    private userService: UsersService,
    private configurationService: ConfigService,
  ) {
    super(repo, configurationService, CreateCustomDto, UpdateCustomDto);
  }

  async findTopOrdered(limit: number): Promise<Custom[]> {
    const topCustoms = await this.repo
      .createQueryBuilder('custom')
      .leftJoin('custom.orders', 'order')
      .select(['custom.id', 'custom.name', 'COUNT(order.id) AS ordersCount'])
      .groupBy('custom.id')
      .having('COUNT(order.id) > 0')
      .orderBy('ordersCount', 'DESC')
      .limit(limit)
      .getRawMany();

    return topCustoms;
  }

  async findUserTopOrdered(userId: number, limit: number): Promise<Custom[]> {
    const user = await this.userService.findOne(userId).catch((err) => {
      throw new NotFoundException(`User not found`);
    });

    const topCustoms = await this.repo
      .createQueryBuilder('custom')
      .leftJoin('custom.orders', 'order', 'order.userId = :userId', {
        userId: user.id,
      })
      .select(['custom.id', 'custom.name', 'COUNT(order.id) AS orders_count'])
      .groupBy('custom.id')
      .having('COUNT(order.id) > 0')
      .orderBy('orders_count', 'DESC')
      .limit(limit)
      .getRawMany();

    return topCustoms;
  }
}

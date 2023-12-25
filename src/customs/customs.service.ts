import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Custom } from './custom.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateCustomDto } from './dtos/create-custom.dto';
import { UpdateCustomDto } from './dtos/update-custom.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class CustomsService {
  constructor(
    @InjectRepository(Custom) private repo: Repository<Custom>,
    private userService: UsersService,
  ) {}

  find(options: FindManyOptions): Promise<Custom[]> {
    return this.repo.find(options);
  }

  async findOne(id: number): Promise<Custom> {
    const doc = await this.repo.findOne({ where: { id } });

    if (!doc) {
      throw new NotFoundException(`Document not found`);
    }

    return doc;
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

  async create(data: CreateCustomDto): Promise<Custom> {
    const doc = this.repo.create(data);
    await this.repo.save(doc);
    return doc;
  }

  async update(id: number, data: UpdateCustomDto) {
    const doc = await this.findOne(id);
    Object.assign(doc, data); // update user with new attrs
    return this.repo.save(doc); // save updated user
  }

  async remove(id: number) {
    const doc = await this.findOne(id);
    return this.repo.remove(doc);
  }
}

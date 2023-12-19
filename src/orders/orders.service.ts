import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(@InjectRepository(Order) private repo: Repository<Order>) {}

  find(options: FindManyOptions) {
    return this.repo.find(options);
  }

  async findOne(id: number) {
    const doc = await this.repo.findOne({ where: { id } });

    if (!doc) {
      throw new NotFoundException(`Documents not found`);
    }
    return doc;
  }

  async create(data: CreateOrderDto) {
    const order = this.repo.create(data);
    await this.repo.save(order);
    return order;
  }

  async update(id: number, data: UpdateOrderDto) {
    const doc = await this.findOne(id);

    if (!doc) {
      throw new NotFoundException(`Documents not found`);
    }
    Object.assign(doc, data); // update user with new attrs
    return this.repo.save(doc); // save updated user
  }

  async remove(id: number) {
    const doc = await this.findOne(id);
    if (!doc) {
      throw new NotFoundException('Document not found');
    }
    return this.repo.remove(doc);
  }
}

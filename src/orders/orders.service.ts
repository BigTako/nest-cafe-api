import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { User } from '../users/user.entity';
import { CustomsService } from '../customs/customs.service';
import { UpdateCurrentUserOrderDto } from './dtos/update-current-user-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private repo: Repository<Order>,
    private customsService: CustomsService,
  ) {}

  find(options: FindManyOptions) {
    return this.repo.find(options);
  }

  async findOne(id: number) {
    const doc = await this.repo.findOne({ where: { id } });

    if (!doc) {
      throw new NotFoundException(`Document not found`);
    }
    return doc;
  }

  async create(customs: number[], user: User) {
    const customsPopulated = await Promise.all(
      customs.map(async (id: number) => {
        return this.customsService.findOne(id).catch((err) => {
          throw new NotFoundException(`Custom with id ${id} not found`);
        });
      }),
    );

    // // Create the Order entity
    const order = this.repo.create({ user, customs: customsPopulated });

    order.totalPrice = customsPopulated.reduce(
      (acc, item) => acc + item.price,
      0,
    );

    await this.repo.save(order);

    return order;
  }

  async update(id: number, data: UpdateOrderDto | UpdateCurrentUserOrderDto) {
    const doc = await this.findOne(id);

    if (data.customs) {
      const customsPopulated = await Promise.all(
        data.customs.map(async (id: number) => {
          return this.customsService.findOne(id).catch((err) => {
            throw new NotFoundException(`Custom with id ${id} found`);
          });
        }),
      );

      doc.customs = customsPopulated;

      doc.totalPrice = customsPopulated.reduce(
        (acc, item) => acc + item.price,
        0,
      );

      delete data.customs;
    }

    Object.assign(doc, data); // update user with new attrs
    return this.repo.save(doc); // save updated user
  }

  async remove(id: number) {
    const doc = await this.findOne(id);
    return this.repo.remove(doc);
  }
}

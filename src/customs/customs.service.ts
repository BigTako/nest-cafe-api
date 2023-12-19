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

@Injectable()
export class CustomsService {
  constructor(@InjectRepository(Custom) private repo: Repository<Custom>) {}

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

  async create(data: CreateCustomDto): Promise<Custom> {
    try {
      const doc = this.repo.create(data);
      await this.repo.save(doc);
      return doc;
    } catch (err) {
      if (err.detail) {
        throw new BadRequestException(err.detail);
      }
      throw new BadRequestException(err.message);
    }
  }

  async update(id: number, data: UpdateCustomDto) {
    try {
      const doc = await this.findOne(id);

      if (!doc) {
        throw new Error(`Documents not found`);
      }
      Object.assign(doc, data); // update user with new attrs
      return this.repo.save(doc); // save updated user
    } catch (err) {
      if (err.detail) {
        throw new BadRequestException(err.detail);
      }
      throw new BadRequestException(err.message);
    }
  }

  async remove(id: number) {
    const doc = await this.findOne(id);
    if (!doc) {
      throw new NotFoundException('Document not found');
    }
    return this.repo.remove(doc);
  }
}

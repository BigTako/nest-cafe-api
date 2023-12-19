import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async find(options: FindManyOptions) {
    return this.repo.find(options);
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findOne(id: number) {
    if (!id) return null;
    return this.repo.findOne({ where: { id } });
  }

  async create(data: CreateUserDto) {
    try {
      const user = this.repo.create(data as User);
      await this.repo.save(user);
      return user;
    } catch (err) {
      if (err.detail) {
        throw new BadRequestException(err.detail);
      }
      throw new BadRequestException(err.message);
    }
  }

  async update(id: number, data: Partial<CreateUserDto>) {
    try {
      const user = await this.findOne(id);
      if (!user) {
        throw new NotFoundException('Document not found');
      }
      Object.assign(user, data); // update user with new attrs
      return this.repo.save(user); // save updated user
    } catch (err) {
      if (err.detail) {
        throw new BadRequestException(err.detail);
      }
      throw new BadRequestException(err.message);
    }
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('Document not found');
    }
    return this.repo.remove(user);
  }
}

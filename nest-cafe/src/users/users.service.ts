import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserPasswordDto } from './dtos/update-user-password.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { CryptoService } from './crypto.service';
import { ServiceFactory } from '../factories/service.factory';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UsersService extends ServiceFactory<User> {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private cryptoService: CryptoService,
    private configurationService: ConfigService,
  ) {
    super(repo, configurationService, CreateUserDto, UpdateUserDto);
  }

  async updatePassword(userId: number, data: UpdateUserPasswordDto) {
    const user = await this.findOne(userId);

    if (
      !(await this.cryptoService.correctPassword(
        user.password,
        data.passwordCurrent,
      ))
    ) {
      throw new BadRequestException(
        this.configurationService.get(
          'errorMessages.INCORRECT_CURRENT_PASSWORD',
        ),
      );
    }

    Object.assign(user, data); // update user with new attrs
    return this.repo.save(user); // save updated user
  }
}

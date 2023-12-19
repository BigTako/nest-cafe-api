import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { CreateUserDto } from '../users/dtos/create-user.dto';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signup(data: CreateUserDto) {
    const { name, email, password } = data;

    const salt = randomBytes(8).toString('hex');

    //Hash the salt and the password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    //Join the hashed result and the salt together
    const result = salt + '.' + hash.toString('hex');

    const user = await this.userService.create({
      name,
      email,
      password: result,
      passwordConfirm: '',
    } as User);

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Incorrect email or password');
    }

    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Incorrect email or password');
    }

    return user;
  }

  async forgotPassword(email: string) {}

  async resetPassword(password: string, passwordConfirm: string) {}
}

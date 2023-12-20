import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

import { CreateUserDto } from '../users/dtos/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { FindManyOptions } from 'typeorm';
const crypto = require('crypto');

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  private async createToken(user: User): Promise<string> {
    return await this.jwtService.signAsync({ id: user.id });
  }

  private async createPasswordResetToken(user: User) {
    const resetToken = crypto.randomBytes(32).toString('hex');

    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // console.log({ resetToken }, this.passwordResetToken);

    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    return resetToken;
  }

  async signup(data: CreateUserDto) {
    const user = await this.userService.create(data);
    let jwt: string;

    try {
      jwt = await this.createToken(user);
    } catch (e) {
      this.userService.remove(user.id);
      throw new BadRequestException(`Error creating token ${e.message}`);
    }

    return { jwt, user };
  }

  async login(email: string, password: string) {
    const [user] = await this.userService.find({ email } as FindManyOptions);
    let jwt: string;

    if (
      !user ||
      !(await this.userService.correctPassword(user.password, password))
    ) {
      throw new BadRequestException('Incorrect email or password');
    }

    try {
      jwt = await this.createToken(user);
    } catch (e) {
      this.userService.remove(user.id);
      throw new BadRequestException(`Error creating token ${e.message}`);
    }

    return { jwt, user };
  }

  async forgotPassword(email: string) {
    // find user by email
    const [user] = await this.userService.find({ email } as FindManyOptions);
    // check if it exists
    if (!user) {
      throw new NotFoundException('No user with that email exists');
    }

    // create a reset token
    const resetToken = await this.createPasswordResetToken(user);
    await this.userService.update(user.id, user);

    // email user the reset token
  }

  async resetPassword(password: string, passwordConfirm: string) {}
}

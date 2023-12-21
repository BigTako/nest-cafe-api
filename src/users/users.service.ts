import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';

import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { UpdateUserPasswordDto } from './dtos/update-user-password.dto';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from './dtos/user.dto';

const scrypt = promisify(_scrypt);
const crypto = require('crypto');

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(8).toString('hex');

    //Hash the salt and the password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    //Join the hashed result and the salt together
    return salt + '.' + hash.toString('hex');
  }

  async correctPassword(storedPassword: string, suppliedPassword: string) {
    const [salt, dbPassHash] = storedPassword.split('.'); // [salt, hash
    console.log(suppliedPassword);
    const suppliedPassHash = (await scrypt(
      suppliedPassword,
      salt,
      32,
    )) as Buffer;

    return dbPassHash === suppliedPassHash.toString('hex');
  }

  async createJWTToken(user: User): Promise<string> {
    return await this.jwtService.signAsync({ id: user.id });
  }

  hashSHA256(str: string): string {
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  async createPasswordResetToken(user: User) {
    const { token: resetToken, hashedToken } =
      await this.createAndHashRandomToken();

    user.passwordResetToken = hashedToken;

    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    return resetToken;
  }

  async createAndHashRandomToken() {
    const token = crypto.randomBytes(32).toString('hex');

    const hashedToken = this.hashSHA256(token);

    return { token, hashedToken };
  }

  async find(options: FindManyOptions) {
    return await this.repo.find(options);
  }

  async findOne(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Document not found');
    }
    return user;
  }

  async create(data: CreateUserDto) {
    const user = this.repo.create(data as unknown as User);
    await this.repo.save(user);
    return user;
  }

  async update(id: number, data: Partial<CreateUserDto>): Promise<User> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('Document not found');
    }

    Object.assign(user, data); // update user with new attrs
    return this.repo.save(user); // save updated user
  }

  async updatePassword(userId: number, data: UpdateUserPasswordDto) {
    const user = await this.findOne(userId);

    if (!(await this.correctPassword(user.password, data.passwordCurrent))) {
      throw new NotFoundException('Given current password is incorrect');
    }

    return this.update(userId, data);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('Document not found');
    }
    return this.repo.remove(user);
  }
}

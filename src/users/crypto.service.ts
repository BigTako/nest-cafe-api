import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { JwtService } from '@nestjs/jwt';

const scrypt = promisify(_scrypt);
const crypto = require('crypto');

@Injectable()
export class CryptoService {
  constructor(private jwtService: JwtService) {}

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(8).toString('hex');

    //Hash the salt and the password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    //Join the hashed result and the salt together
    return salt + '.' + hash.toString('hex');
  }

  async correctPassword(storedPassword: string, suppliedPassword: string) {
    const [salt, dbPassHash] = storedPassword.split('.'); // [salt, hash
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
}

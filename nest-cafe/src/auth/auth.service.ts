import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';

import { CreateUserDto } from '../users/dtos/create-user.dto';
import { FindManyOptions, MoreThan } from 'typeorm';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { CryptoService } from '../users/crypto.service';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private emailService: EmailService,
    private usersService: UsersService,
    private cryptoService: CryptoService,
  ) {}

  private async singToken(user: User): Promise<string> {
    try {
      return await this.cryptoService.createJWTToken(user);
    } catch (e) {
      this.usersService.remove(user.id);
      throw new BadRequestException(
        this.configService.get('errorMessages.ERROR_CREATING_TOKEN'),
      );
    }
  }

  async signup(data: CreateUserDto, req: Request) {
    // create an account activation token
    const { token: activationToken, hashedToken } =
      await this.cryptoService.createAndHashRandomToken();

    const user = await this.usersService.create({
      ...data,
      accountActivationToken: hashedToken,
      accountActivationTokenExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    const curHost = `${req.protocol}://${req.get('host')}`;
    const text = `Activate your account by submitting a PATCH request to: ${curHost}/api/v1/auth/activateAccount/${activationToken}`;

    try {
      const options = {
        to: user.email,
        subject: 'Your account activation token (valid for 10 min)',
        text,
      };

      this.emailService.newTransporter();
      await this.emailService.sendEmail(options);
      return { message: 'success' };
    } catch (e) {
      await this.usersService.remove(user.id);
      throw new BadRequestException(
        this.configService.get('errorMessages.EMAIL_SENDING_ERROR'),
      );
    }
  }

  async activateAccount(token: string) {
    const hashedToken = this.cryptoService.hashSHA256(token);

    const [user] = await this.usersService.find({
      where: {
        activated: false,
        accountActivationToken: hashedToken,
        accountActivationTokenExpires: MoreThan(new Date()),
      },
    });

    // if token has not expired, and there is user, set the new password
    if (!user) {
      throw new BadRequestException(
        this.configService.get('errorMessages.INVALID_TOKEN'),
      );
    }
    const updatedUser = await this.usersService.update(user.id, {
      activated: true,
      accountActivationToken: '',
      accountActivationTokenExpires: null,
    });

    const jwt = await this.singToken(updatedUser);

    return { jwt, user: updatedUser };
  }

  async login(email: string, password: string) {
    const [user] = await this.usersService.find({
      where: { email, active: true, activated: true },
    } as FindManyOptions);
    if (
      !user ||
      !(await this.cryptoService.correctPassword(user.password, password))
    ) {
      throw new BadRequestException(
        this.configService.get('errorMessages.INVALID_CREDENTIALS'),
      );
    }
    const jwt = await this.singToken(user);

    return { jwt, user };
  }

  async forgotPassword(email: string, req: Request) {
    // find user by email
    const [user] = await this.usersService.find({
      where: { email, active: true, activated: true },
    } as FindManyOptions);
    // check if it exists
    if (!user) {
      throw new NotFoundException(
        this.configService.get('errorMessages.UNKNOWN_USER'),
      );
    }

    // create a reset token
    const resetToken = await this.cryptoService.createPasswordResetToken(user);
    await this.usersService.update(user.id, user);

    const curHost = `${req.protocol}://${req.get('host')}`;
    const text = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${curHost}/api/v1/auth/resetPassword/${resetToken}`;
    try {
      const options = {
        to: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        text,
      };
      this.emailService.newTransporter();
      await this.emailService.sendEmail(options);
      return { message: 'success' };
    } catch (e) {
      user.passwordResetToken = '';
      user.passwordResetExpires = null;
      await this.usersService.update(user.id, user);
      console.log(e);
      throw new BadRequestException(
        this.configService.get<string>('errorMessages.EMAIL_SENDING_ERROR'),
      );
    }
  }

  async resetPassword(
    token: string,
    password: string,
    passwordConfirm: string,
  ) {
    // get user based on the token
    const hashedToken = this.cryptoService.hashSHA256(token);

    const [user] = await this.usersService.find({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: MoreThan(new Date()),
      },
    });

    // if token has not expired, and there is user, set the new password
    if (!user) {
      throw new BadRequestException(
        this.configService.get('errorMessages.INVALID_TOKEN'),
      );
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = '';
    user.passwordResetExpires = null;

    await this.usersService.update(user.id, user);

    const jwt = await this.singToken(user);

    return { jwt, user };
  }
}

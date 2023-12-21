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

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private emailService: EmailService,
    private userService: UsersService,
  ) {}

  private async singToken(user: User): Promise<string> {
    try {
      return await this.userService.createJWTToken(user);
    } catch (e) {
      this.userService.remove(user.id);
      throw new BadRequestException(`Error creating token ${e.message}`);
    }
  }

  async signup(data: CreateUserDto) {
    // create an account activation token
    const { token: activationToken, hashedToken } =
      await this.userService.createAndHashRandomToken();

    const user = await this.userService.create({
      ...data,
      accountActivationToken: hashedToken,
      accountActivationTokenExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    try {
      const options = {
        to: user.email,
        subject: 'Your account activation token (valid for 10 min)',
        text: `Activate your account by submitting a PATCH request to: ${this.configService.get<string>(
          'HOST',
        )}/api/v1/auth/activateAccount/${activationToken}`,
      };

      this.emailService.newTransporter();
      await this.emailService.sendEmail(options);
      return { message: 'success' };
    } catch (e) {
      await this.userService.remove(user.id);
      throw new BadRequestException(
        `There was an error sending the email. Try again later!`,
      );
    }
  }

  async activateAccount(token: string) {
    const hashedToken = this.userService.hashSHA256(token);

    const [user] = await this.userService.find({
      where: {
        activated: false,
        accountActivationToken: hashedToken,
        accountActivationTokenExpires: MoreThan(new Date()),
      },
    });

    // if token has not expired, and there is user, set the new password
    if (!user) {
      throw new BadRequestException('Token is invalid or has expired');
    }
    const updatedUser = await this.userService.update(user.id, {
      activated: true,
      accountActivationToken: '',
      accountActivationTokenExpires: null,
    });

    const jwt = await this.singToken(updatedUser);

    return { jwt, user: updatedUser };
  }

  async login(email: string, password: string) {
    const [user] = await this.userService.find({
      where: { email, active: true, activated: true },
    } as FindManyOptions);

    if (
      !user ||
      !(await this.userService.correctPassword(user.password, password))
    ) {
      throw new BadRequestException('Incorrect email or password');
    }
    const jwt = await this.singToken(user);

    return { jwt, user };
  }

  async forgotPassword(email: string) {
    // find user by email
    const [user] = await this.userService.find({
      where: { email, active: true, activated: true },
    } as FindManyOptions);
    // check if it exists
    if (!user) {
      throw new NotFoundException('No user with that email exists');
    }

    // create a reset token
    const resetToken = await this.userService.createPasswordResetToken(user);
    await this.userService.update(user.id, user);

    try {
      const options = {
        to: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        text: `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${this.configService.get<string>(
          'HOST',
        )}/api/v1/auth/resetPassword/${resetToken}`,
      };
      this.emailService.newTransporter();
      await this.emailService.sendEmail(options);
      return { message: 'success' };
    } catch (e) {
      user.passwordResetToken = '';
      user.passwordResetExpires = null;
      await this.userService.update(user.id, user);
      console.log(e);
      throw new BadRequestException(
        `There was an error sending the email. Try again later!`,
      );
    }
  }

  async resetPassword(
    token: string,
    password: string,
    passwordConfirm: string,
  ) {
    // get user based on the token
    const hashedToken = this.userService.hashSHA256(token);

    const [user] = await this.userService.find({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: MoreThan(new Date()),
      },
    });

    // if token has not expired, and there is user, set the new password
    if (!user) {
      throw new BadRequestException('Token is invalid or has expired');
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = '';
    user.passwordResetExpires = null;

    await this.userService.update(user.id, user);

    const jwt = await this.singToken(user);

    return { jwt, user };
  }
}

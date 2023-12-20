import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';

import { CreateUserDto } from '../users/dtos/create-user.dto';
import { FindManyOptions } from 'typeorm';
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
    const user = await this.userService.create(data);

    const jwt = await this.singToken(user);

    return { jwt, user };
  }

  async login(email: string, password: string) {
    const [user] = await this.userService.find({
      where: { email },
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
    const [user] = await this.userService.find({ email } as FindManyOptions);
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
        text: `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetToken}`,
      };
      this.emailService.newTransporter();
      await this.emailService.sendEmail(options);
    } catch (e) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await this.userService.update(user.id, user);
      console.log(e);
      throw new BadRequestException(
        `There was an error sending the email. Try again later!`,
      );
    }
  }

  async resetPassword(password: string, passwordConfirm: string) {}
}

import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  Res,
  Session,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { Response } from 'express';
import { SerializeAuth } from '../interceptors/serialize.interceptor';
import { UserDto } from '../users/dtos/user.dto';
import { UpdateUserPasswordDto } from '../users/dtos/update-user-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @SerializeAuth(UserDto)
  @Post('signup')
  async signup(@Body() body: CreateUserDto) {
    const data = await this.authService.signup(body);
    return data;
  }

  @SerializeAuth(UserDto)
  @Post('login')
  async login(@Body() body: LoginDto) {
    const data = await this.authService.login(body.email, body.password);
    return data;
  }

  @SerializeAuth(UserDto)
  @Post('logout')
  logout(@Res() res: Response) {
    res.setHeader('Authorization', '');
    res.cookie('jwt', '');
    res.json({ message: 'success' });
  }

  @Post('forgotPassword')
  async forgotPassword(@Body() body: Partial<CreateUserDto>) {
    await this.authService.forgotPassword(body.email);
    return { message: 'success' };
  }

  @Patch('resetPassword/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() body: Partial<UpdateUserPasswordDto>,
  ) {
    await this.authService.resetPassword(
      token,
      body.password,
      body.passwordConfirm,
    );
    return { message: 'success' };
  }
}

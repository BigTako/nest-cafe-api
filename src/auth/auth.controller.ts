import { Body, Controller, Post, Req, Res, Session } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { Response } from 'express';
import { SerializeAuth } from '../interceptors/serialize.interceptor';
import { UserDto } from '../users/dtos/user.dto';

@Controller('auth')
@SerializeAuth(UserDto)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: CreateUserDto) {
    const data = await this.authService.signup(body);
    return data;
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const data = await this.authService.login(body.email, body.password);
    return data;
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.setHeader('Authorization', '');
    res.cookie('jwt', '');
    res.json({ message: 'success' });
  }
}

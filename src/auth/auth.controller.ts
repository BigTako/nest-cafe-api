import { Body, Controller, Post, Req, Res, Session } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: CreateUserDto, @Res() res: Response) {
    const data = await this.authService.signup(body);
    res.setHeader('Authorization', `Bearer ${data.jwt}`);
    res.cookie('jwt', data.jwt);
    res.json(data);
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Res() res: Response) {
    const data = await this.authService.login(body.email, body.password);
    res.setHeader('Authorization', `Bearer ${data.jwt}`);
    res.cookie('jwt', data.jwt);
    res.json(data);
  }

  @Post('logout')
  logout(@Session() session: any) {
    session.userId = null;
  }
}

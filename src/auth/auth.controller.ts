import { Body, Controller, Post, Session } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signup(body);
    session.userId = user.id;
    return user;
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Session() session: any) {
    const user = await this.authService.login(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('logout')
  logout(@Session() session: any) {
    session.userId = null;
  }
}

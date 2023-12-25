import { Body, Controller, Param, Patch, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { Response } from 'express';
import { Serialize } from '../decorators/serialize.decorator';
import { UserPasswordDto } from '../users/dtos/user-password.dto';
import { AuthResponceDto } from './dtos/auth-responce.dto';
import { SetAuthorization } from '../decorators/set-auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: CreateUserDto) {
    const data = await this.authService.signup(body);
    return data;
  }

  @SetAuthorization('jwt')
  @Serialize(AuthResponceDto)
  @Patch('activateAccount/:token')
  async activateAccount(@Param('token') token: string) {
    const data = await this.authService.activateAccount(token);
    return data;
  }

  @Post('login')
  @SetAuthorization('jwt')
  @Serialize(AuthResponceDto)
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

  @Post('forgotPassword')
  async forgotPassword(@Body() body: Partial<CreateUserDto>) {
    await this.authService.forgotPassword(body.email);
    return { message: 'success' };
  }

  @Patch('resetPassword/:token')
  @SetAuthorization('jwt')
  @Serialize(AuthResponceDto)
  async resetPassword(
    @Param('token') token: string,
    @Body() body: UserPasswordDto,
  ) {
    return await this.authService.resetPassword(
      token,
      body.password,
      body.passwordConfirm,
    );
  }
}

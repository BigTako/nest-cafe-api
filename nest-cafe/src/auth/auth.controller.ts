import { Body, Controller, Param, Patch, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { Request, Response } from 'express';
import { Serialize } from '../decorators/serialize.decorator';
import { UserPasswordDto } from '../users/dtos/user-password.dto';
import { AuthResponceDto } from './dtos/auth-responce.dto';
import { SetAuthorization } from '../decorators/set-auth.decorator';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: CreateUserDto, @Req() request: Request) {
    const data = await this.authService.signup(body, request);
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
  async forgotPassword(
    @Body() body: Partial<CreateUserDto>,
    @Req() request: Request,
  ) {
    await this.authService.forgotPassword(body.email, request);
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

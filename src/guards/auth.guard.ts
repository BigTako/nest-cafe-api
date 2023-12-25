import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        this.configService.get('errorMessages.UNAUTHORIZED_ACCESS'),
      );
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await this.userService.findOne(Number(payload.id));
      request['user'] = user;
    } catch {
      throw new UnauthorizedException(
        this.configService.get('errorMessages.UNAUTHORIZED_ACCESS'),
      );
    }
    return true;
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    let token: string;

    if (req?.headers?.authorization) {
      var [type, reqToken] = req.headers?.authorization?.split(' ');
      if (type && type === 'Bearer' && reqToken && reqToken !== 'null') {
        token = reqToken;
      }
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    return token;
  }
}

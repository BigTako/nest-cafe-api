import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { Request } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

      const cacheUser = await this.cacheManager.get('currentUser');

      if (cacheUser) {
        request['user'] = cacheUser;
      } else {
        const user = await this.userService.findOne(Number(payload.id));
        request['user'] = user;
        await this.cacheManager.set('currentUser', user);
      }
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

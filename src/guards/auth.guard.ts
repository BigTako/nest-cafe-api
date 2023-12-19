import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configServie: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'You are not logged in! Please log in to get access.',
      );
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configServie.get('JWT_SECRET'),
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException(
        'You are not logged in! Please log in to get access.',
      );
    }
    return true;
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    let token: string;
    const [type, reqToken] = req.headers.authorization.split(' ');

    if (type === 'Bearer' && reqToken && reqToken !== 'null') {
      token = reqToken;
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    return token;
  }
}

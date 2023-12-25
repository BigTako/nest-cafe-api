import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from '../email/email.service';

@Module({
  imports: [UsersModule],
  providers: [AuthService, EmailService],
  controllers: [AuthController],
  exports: [AuthService, EmailService],
})
export class AuthModule {}

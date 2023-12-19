import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { AuthController } from '../auth/auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, AuthController],
  providers: [UsersService, AuthService],
  exports: [UsersService],
})
export class UsersModule {}

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {});

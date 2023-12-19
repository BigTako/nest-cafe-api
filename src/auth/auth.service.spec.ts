import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/user.entity';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  let fakeUsersRepo: User[] = [];

  const dumpName = 'alex';
  const dumpEmail = 'alex123@gmail.com';
  const dumpPassword = '12345678';
  beforeEach(async () => {
    fakeUsersService = {
      find: () => Promise.resolve(fakeUsersRepo),
      findByEmail: (email: string) => {
        const user = fakeUsersRepo.find((user) => user.email === email) as User;
        return Promise.resolve(user);
      },
      create: (data: CreateUserDto) => {
        const user = {
          id: Math.floor(Math.random() * 9999),
          ...data,
        } as User;
        fakeUsersRepo.push(user);
        return Promise.resolve(user);
      },
      update: (id: number, data: Partial<CreateUserDto>) => {
        const user = fakeUsersRepo.find((user) => user.id === id);
        Object.assign(user, data);
        return Promise.resolve(user);
      },
      remove: (id: number) => {
        fakeUsersRepo = fakeUsersRepo.filter((user) => user.id !== id);
        return Promise.resolve(null);
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user with a salted and hashed password', async () => {
    const user = await service.signup({
      name: dumpName,
      email: dumpEmail,
      password: dumpPassword,
      passwordConfirm: dumpPassword,
    } as User);

    expect(user).toBeDefined();
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('should throw BadRequestException trying to sign up with email which is in use', async () => {
    await expect(
      await service.signup({
        name: dumpName,
        email: dumpEmail,
        password: dumpPassword,
        passwordConfirm: dumpPassword,
      } as User),
    ).rejects.toThrow(BadRequestException);
  });
});

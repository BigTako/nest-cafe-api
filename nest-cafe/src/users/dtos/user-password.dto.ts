import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UserPasswordDto extends PickType(CreateUserDto, [
  'password',
  'passwordConfirm',
]) {}

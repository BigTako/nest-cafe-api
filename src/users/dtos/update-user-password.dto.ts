import { PickType } from '@nestjs/mapped-types';
import { IsString, Length } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserPasswordDto extends PickType(CreateUserDto, [
  'password',
  'passwordConfirm',
]) {
  @IsString({
    message: 'Current password is required and must be a string',
  })
  @Length(8, 256)
  readonly passwordCurrent: string;
}

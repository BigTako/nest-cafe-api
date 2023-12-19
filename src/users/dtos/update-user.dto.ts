import { Optional } from '@nestjs/common';
import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class UpdateUserDto {
  @Optional()
  @IsString()
  readonly name: string;

  @Optional()
  @IsEmail()
  readonly email: string;

  @Optional()
  @IsString()
  readonly role: string;

  @Optional()
  @IsBoolean()
  active: boolean;

  @Optional()
  @IsBoolean()
  activated: boolean;
}

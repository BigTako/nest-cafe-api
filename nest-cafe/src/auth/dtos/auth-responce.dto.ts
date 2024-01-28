import { Expose, Transform, plainToClass } from 'class-transformer';
import { UserDto } from '../../users/dtos/user.dto';

export class AuthResponceDto {
  @Expose()
  jwt: string;

  @Expose()
  @Transform(({ obj }) =>
    plainToClass(UserDto, obj.user, { excludeExtraneousValues: true }),
  )
  user: UserDto;
}

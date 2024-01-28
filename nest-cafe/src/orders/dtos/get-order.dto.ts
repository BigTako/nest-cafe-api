import { Expose, Transform, plainToClass } from 'class-transformer';
import { UserDto } from '../../users/dtos/user.dto';
import { CustomDto } from '../../customs/dtos/custom.dto';
import { Custom } from '../../customs/custom.entity';

export class GetOrderGto {
  @Expose()
  id: number;

  @Expose()
  status: string;

  @Expose()
  createdAt: number;

  @Expose()
  totalPrice: number;

  @Expose()
  @Transform(({ obj }) => {
    return plainToClass(UserDto, obj.user, { excludeExtraneousValues: true });
  })
  user: UserDto;

  @Expose()
  @Transform(({ obj }) => {
    return obj.customs.map((custom: Custom) =>
      plainToClass(CustomDto, custom, { excludeExtraneousValues: true }),
    );
  })
  customs: CustomDto[];
}

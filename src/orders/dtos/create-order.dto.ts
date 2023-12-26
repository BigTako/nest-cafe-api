import { ArrayMinSize, IsArray, IsNumber, IsPositive } from 'class-validator';
import { Custom } from './../../customs/custom.entity';
import { Expose } from 'class-transformer';
import { User } from '../../users/user.entity';

export class CreateOrderDto {
  user: User;

  @IsNumber()
  @IsPositive()
  totalPrice: number;

  @IsArray()
  @ArrayMinSize(1)
  customs: Custom[];
}

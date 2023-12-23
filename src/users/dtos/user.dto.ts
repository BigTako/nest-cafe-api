import { Expose } from 'class-transformer';
import { Order } from '../../orders/order.entity';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  createdAt: Date;

  @Expose()
  orders: Order[];
}

import { CreateOrderDto } from '../src/orders/dtos/create-order.dto';
import { Status } from '../src/orders/enums/order-status.enum';
import { Order } from '../src/orders/order.entity';
import { customsData } from './customs-test-data';
import { dumpUser } from './users-test-data';

export const orders: any = [
  {
    status: Status.New,
    createdAt: new Date(),
  },
  {
    status: Status.Paid,
    createdAt: new Date(),
  },
  {
    status: Status.Unpaid,
    createdAt: new Date(),
  },
];

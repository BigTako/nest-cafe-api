import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Order } from '../orders/order.entity';
import { Category } from './enums/custom-category.enum';

@Entity({ name: 'customs' })
export class Custom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @ManyToMany(() => Order, (order) => order.customs, {
    onDelete: 'CASCADE',
  })

  orders: Order[];

  @Column()
  category: Category;

  @Column()
  compounds: string;

  @CreateDateColumn()
  createdAt: Date;
}

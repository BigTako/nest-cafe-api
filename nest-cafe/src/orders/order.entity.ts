import { Custom } from '../customs/custom.entity';
import { User } from '../users/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { Status } from './enums/order-status.enum';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.orders, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ default: Status.New })
  status: Status;

  @Column({ default: 0 })
  totalPrice: number;

  @ManyToMany(() => Custom, (custom) => custom.orders, {
    cascade: true,
    eager: true,
  })
  @JoinTable()
  customs: Custom[];

  @CreateDateColumn()
  createdAt: Date;
}

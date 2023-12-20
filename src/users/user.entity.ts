import { Exclude } from 'class-transformer';
import { Order } from '../orders/order.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  passwordConfirm: string;

  @Column({ default: 'user' })
  role: string;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @Column({ default: false })
  active: boolean;

  @Column({ default: false })
  activated: true;

  @Column({ nullable: true })
  accountActivationToken: string;

  @Column({ nullable: true })
  accountActivationTokenExpires: Date;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetExpires: Date;

  @CreateDateColumn()
  createdAt: Date;
}

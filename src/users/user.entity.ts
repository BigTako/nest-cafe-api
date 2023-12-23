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

  @OneToMany(() => Order, (order) => order.user, {
    onDelete: 'CASCADE',
  })
  orders: Order[];

  @Column()
  password: string;

  @Column()
  passwordConfirm: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  activated: boolean;

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

import { Custom } from '../customs/custom.entity';
import { User } from '../users/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';

export enum Status {
  New = 'new',
  Paid = 'paid',
  Unpaid = 'unpaid',
  Resolved = 'resolved',
  Cancelled = 'cancelled',
}

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @OneToOne(() => User, (user) => user.id) // report.user is foreign key to User instance
  user: number;

  @Column()
  status: Status;

  @ManyToMany(() => Custom, (custom) => custom.id)
  @JoinTable()
  customs: number[];

  @CreateDateColumn()
  created: Date;
}

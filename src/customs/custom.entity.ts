import { Min } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum Category {
  Pizza = 'pizza',
  Burger = 'burger',
  Drink = 'drink',
  Cultery = 'cultery',
}

@Entity({ name: 'customs' })
export class Custom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  category: Category;

  @Column()
  compounds: string;

  @CreateDateColumn()
  createdAt: Date;
}

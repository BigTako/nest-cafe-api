import { Expose } from 'class-transformer';
import { Category } from '../enums/custom-category.enum';

export class CustomDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  price: number;

  @Expose()
  category: Category;

  @Expose()
  compounds: string;
}

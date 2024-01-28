import { IsNumber, IsString, Length, Max, Min } from 'class-validator';
import { Category } from '../enums/custom-category.enum';

export class CreateCustomDto {
  @IsString()
  @Length(3, 128)
  name: string;

  @IsNumber()
  @Min(0)
  @Max(3000)
  price: number;

  @IsString()
  category: Category;

  @IsString()
  compounds: string;
}

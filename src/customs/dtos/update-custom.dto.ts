import {
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { Category } from '../enums/custom-category.enum';

export class UpdateCustomDto {
  @IsOptional()
  @IsString()
  @Length(3, 128)
  name: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(3000)
  price: number;

  @IsOptional()
  @IsString()
  category: Category;

  @IsOptional()
  @IsString()
  compounds: string;
}

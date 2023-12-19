import { IsNumber, IsString, Length, Max, Min } from 'class-validator';
import { Category } from '../custom.entity';

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

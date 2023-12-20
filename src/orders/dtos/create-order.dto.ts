import { ArrayMinSize, IsArray, IsNumber } from 'class-validator';
import { Custom } from './../../customs/custom.entity';

export class CreateOrderDto {
  @IsNumber()
  user: number;

  @IsArray()
  @ArrayMinSize(1)
  customs: number[];
}

import { ArrayMinSize, IsArray, IsPositive } from 'class-validator';
import { Custom } from './../../customs/custom.entity';

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  customs: number[];
}

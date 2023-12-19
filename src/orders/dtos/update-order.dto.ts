import { ArrayMinSize, IsArray, IsNumber } from 'class-validator';

export class UpdateOrderDto {
  @IsNumber()
  user: number;

  @IsArray()
  @ArrayMinSize(1)
  customs: number[];
}

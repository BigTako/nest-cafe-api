import { ArrayMinSize, IsArray, IsEnum, IsOptional } from 'class-validator';
import { Status } from '../enums/order-status.enum';
import { Custom } from '../../customs/custom.entity';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(Status)
  status: Status;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  customs: Custom[];
}

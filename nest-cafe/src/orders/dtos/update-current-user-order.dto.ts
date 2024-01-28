import { ArrayMinSize, IsArray, IsEnum, IsOptional } from 'class-validator';
import { CurUserOrderStatus } from '../enums/order-status.enum';

export class UpdateCurrentUserOrderDto {
  @IsOptional()
  @IsEnum(CurUserOrderStatus)
  status: CurUserOrderStatus;

  @IsArray()
  @ArrayMinSize(1)
  customs: number[];
}

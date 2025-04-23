import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsString, ValidateNested, Min, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

class ItemDto {
  @IsString()
  @IsNotEmpty()
  medicine: Types.ObjectId;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  salePrice?: number;
}

export class CreatePurchaseDto {
  
  @IsNotEmpty()
  supplierId: Types.ObjectId;

  @IsDateString()
  date: string;

  @IsString()
  type: 'PURCHASE' | 'RETURN';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];

  @IsNumber()
  @Min(0)
  totalAmount: number;
}

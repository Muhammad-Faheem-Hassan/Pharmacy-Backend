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
}

export class CreateSaleDto {

  @IsString()
  @IsNotEmpty()
  customer: string;

  @IsDateString()
  date: string;

  @IsString()
  type: 'SALE' | 'RETURN';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];

  @IsNumber()
  @Min(0)
  totalAmount: number;
}

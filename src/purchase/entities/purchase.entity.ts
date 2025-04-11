import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PurchaseDocument = Purchase & Document;

@Schema()
export class Item {
  @Prop({ required: true })
  medicine: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;
}

const ItemSchema = SchemaFactory.createForClass(Item);

@Schema({ timestamps: true })
export class Purchase {
  @Prop({ required: true })
  supplierName: string;

  @Prop({ required: true })
  date: string;

  @Prop({ type: [ItemSchema], required: true })
  items: Item[];

  @Prop({ required: true })
  totalAmount: number;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
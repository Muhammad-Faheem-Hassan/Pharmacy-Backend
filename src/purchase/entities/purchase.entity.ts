import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PurchaseDocument = Purchase & Document;

@Schema()
export class Item {
  @Prop({ type: Types.ObjectId, ref: 'Medicine', required: true })
  medicine: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: false })
  salePrice: number;
}

const ItemSchema = SchemaFactory.createForClass(Item);

@Schema({ timestamps: true })
export class Purchase {
  @Prop({ type: Types.ObjectId, ref: 'Supplier', required: true })
  supplierId: Types.ObjectId;

  @Prop({ required: true })
  date: string;

  @Prop({ type: String, enum: ['PURCHASE', 'RETURN'], default: 'PURCHASE' })
  type: 'SALE' | 'RETURN';

  @Prop({ type: [ItemSchema], required: true })
  items: Item[];

  @Prop({ required: true })
  totalAmount: number;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
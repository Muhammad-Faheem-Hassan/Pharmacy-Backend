import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SaleDocument = Sale & Document;

@Schema()
export class Item {
    @Prop({ type: Types.ObjectId, ref: 'Medicine', required: true })
    medicine: Types.ObjectId;

    @Prop({ required: true })
    quantity: number;

    @Prop({ required: true })
    price: number;
}

const ItemSchema = SchemaFactory.createForClass(Item);

@Schema({ timestamps: true })
export class Sale {
    @Prop({ required: true })
    customer: string;

    @Prop({ required: true })
    date: string;

    @Prop({ type: String, enum: ['SALE', 'RETURN'], default: 'SALE' })
    type: 'SALE' | 'RETURN';

    @Prop({ type: [ItemSchema], required: true })
    items: Item[];

    @Prop({ required: true })
    totalAmount: number;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
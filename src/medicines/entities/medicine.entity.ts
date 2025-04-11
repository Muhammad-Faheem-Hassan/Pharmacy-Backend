import { Type } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MedicineDocument = Medicine & Document;


@Schema({ timestamps: true })
export class Medicine {
    @Prop({ required: false })
    name: string;

    @Prop({ required: false })
    batchNumber: string;

    @Prop({ required: false })
    expiryDate: Date;

    @Prop({ required: false, default: 0 })
    quantity: number;

    @Prop({ required: false, default: 0 })
    purchasePrice: number;

    @Prop({ required: false, default: 0 })
    salePrice: number;
}

export const MedicineSchema = SchemaFactory.createForClass(Medicine);
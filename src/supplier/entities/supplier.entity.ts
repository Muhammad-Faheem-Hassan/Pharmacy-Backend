
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SupplierDocument = Supplier & Document;


@Schema({ timestamps: true })
export class Supplier {
    @Prop({ required: false })
    name: string;

    @Prop({ required: false })
    address: string;

    @Prop({ required: false })
    phone: string;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
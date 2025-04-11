import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SettingDocument = Setting & Document;
@Schema()
export class Setting {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  value: string;

  @Prop({ default: 0 })
  priority: number;

  @Prop({ required: false })
  type: string;

  @Prop({ type: Object })
  config: object;

  @Prop({ required: true, default: false })
  isInternal: boolean;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);

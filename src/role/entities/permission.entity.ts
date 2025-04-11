import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
export type PermissionDocument = Permission & Document;

@Schema()
export class Permission {
  @Prop({ required: true })
  module: string;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true, unique: true })
  identifier: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

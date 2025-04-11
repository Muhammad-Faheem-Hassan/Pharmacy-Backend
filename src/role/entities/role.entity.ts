import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
export type RoleDocument = Role & Document;

@Schema()
export class Role {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  identifier: string;

  @Prop({ required: true, default: [] })
  permissions: string[];

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ default: true })
  isDeleteAble: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

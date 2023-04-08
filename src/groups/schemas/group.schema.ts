import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GroupDocument = Group & Document;

@Schema()
export class Group {
  _id: string;
  get id() {
    return this._id;
  }

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  sku: string;

  @Prop()
  description: string;

  @Prop()
  perms: string[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);

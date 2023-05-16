import { Schema, Prop } from '@nestjs/mongoose';
import { SchemaFactory } from '@nestjs/mongoose/dist';
import mongoose from 'mongoose';
import { Group } from 'src/groups/schemas/group.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
  _id: string;
  get id() {
    return this._id;
  }

  @Prop({ required: true })
  nameFirst: string;

  @Prop({ required: true })
  nameLast: string;

  @Prop({ required: true })
  nameFull: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'group' }],
    required: true,
  })
  groups: Group[];

  // Not stored in DB
  perms: string[];

  @Prop({ required: true })
  isActive: boolean;

  @Prop({ required: true })
  isBanned: boolean;

  @Prop({ required: true })
  email: string;

  @Prop({ required: false })
  customDomainEmail: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

import { Schema, Prop } from '@nestjs/mongoose';
import { SchemaFactory } from '@nestjs/mongoose/dist';
import { Member } from 'src/members/schemas/member.schema';
import mongoose from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  _id: string;
  get id() {
    return this._id;
  }

  @Prop({ required: true })
  ghUsername: string;

  @Prop({ required: false })
  ghName?: string;

  @Prop({ required: true })
  ghId: number;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'member' }],
    required: true,
  })
  member: Member;
}

export const UserSchema = SchemaFactory.createForClass(User);

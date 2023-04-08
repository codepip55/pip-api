import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Group } from 'src/groups/schemas/group.schema';
import mongoose from 'mongoose';

export type MemberDocument = Member & Document;

@Schema()
export class Member {
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
}

export const MemberSchema = SchemaFactory.createForClass(Member);

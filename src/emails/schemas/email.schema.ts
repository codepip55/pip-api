import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type EmailDocument = Email & Document;

@Schema()
export class Email {
  _id: string;
  get id() {
    return this._id;
  }

  @Prop(
    raw({
      name: { type: String, required: false },
      email: { type: String, required: false },
    }),
  )
  sender: {
    name?: string;
    email?: string;
  };

  @Prop(
    raw({
      name: { type: String, required: false },
      email: { type: String, required: false },
    }),
  )
  receiver: {
    name?: string;
    email?: string;
  };

  @Prop(
    raw({
      content: { type: String, required: true },
      html: { type: String, required: true },
    }),
  )
  subject: {
    content: string;
    html: string;
  };

  @Prop(
    raw({
      content: { type: String, required: true },
      html: { type: String, required: true },
    }),
  )
  body: {
    content: string;
    html: string;
  };

  @Prop()
  deletedTimestamp: number | null;

  @Prop({ required: true })
  tags: string[];

  @Prop({ required: true })
  sendDate: Date;

  @Prop({ required: true })
  isStarred: boolean;

  @Prop({ required: true })
  isRead: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'emails' })
  replies?: Email[];
}

export const EmailSchema = SchemaFactory.createForClass(Email);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OAuth2Client } from './client.schema';
import { User } from 'src/users/schemas/users.schema';
import mongoose, { Document } from 'mongoose';

export type AuthorizationCodeDocument = AuthorizationCode & Document;

@Schema()
export class AuthorizationCode {
  @Prop({ required: true })
  authorizationCode: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ required: true })
  redirectUri: string;

  @Prop({ required: true })
  scope?: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'client' }],
    required: true,
  })
  client: OAuth2Client;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    required: true,
  })
  user: User;
}

export const AuthorizationCodeSchema =
  SchemaFactory.createForClass(AuthorizationCode);

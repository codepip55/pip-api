import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OAuth2Client } from './client.schema';
import { User } from 'src/users/schemas/users.schema';
import mongoose, { Document } from 'mongoose';

export type AccessTokenDocument = AccessToken & Document;
export type RefreshTokenDocument = RefreshToken & Document;

@Schema()
export class AccessToken {
  @Prop({ required: true })
  accessToken: string;

  @Prop({ required: true })
  accessTokenExpiresAt: Date;

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

  @Prop({ required: true })
  scopes: string[];
}

@Schema()
export class RefreshToken {
  @Prop({ required: true })
  refreshToken: string;

  @Prop({ required: true })
  refreshTokenExpiresAt: Date;

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

  @Prop({ required: true })
  scopes: string[];
}

export const AccessTokenSchema = SchemaFactory.createForClass(AccessToken);
export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

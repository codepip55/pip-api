import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OAuth2ClientDocument = OAuth2Client & Document;

@Schema()
export class OAuth2Client {
  @Prop({ required: true })
  clientId: string;

  @Prop({ required: true })
  clientSecret: string;

  @Prop({ required: true })
  redirectUris: string[];

  @Prop({ required: true })
  clientGrants: string[];

  @Prop({ required: true })
  homepageUrl: string;

  @Prop({ required: true })
  privacyPoliyUrl: string;
}

export const OAuth2ClientSchema = SchemaFactory.createForClass(OAuth2Client);

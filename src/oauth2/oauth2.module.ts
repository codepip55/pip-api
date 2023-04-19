import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Oauth2Controller } from './oauth2.controller';
import { Oauth2Service } from './oauth2.service';
import { OAuth2ClientSchema } from './schemas/client.schema';
import { AccessTokenSchema, RefreshTokenSchema } from './schemas/token.schema';
import { AuthorizationCodeSchema } from './schemas/authCode.schema';
import { UserSchema } from 'src/users/schemas/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'client', schema: OAuth2ClientSchema },
      { name: 'accesstoken', schema: AccessTokenSchema },
      { name: 'refreshtoken', schema: RefreshTokenSchema },
      { name: 'authcode', schema: AuthorizationCodeSchema },
      { name: 'user', schema: UserSchema }
    ]),
  ],
  controllers: [Oauth2Controller],
  providers: [Oauth2Service],
})
export class Oauth2Module {}

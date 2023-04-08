import { Module } from '@nestjs/common';
import { OAuth2ServerModule } from '@t00nday/nestjs-oauth2-server';
import { MongooseModule } from '@nestjs/mongoose';

import { Oauth2Controller } from './oauth2.controller';
import { Oauth2Service } from './oauth2.service';
import { OAuth2ClientSchema } from './schemas/client.schema';
import { AccessTokenSchema, RefreshTokenSchema } from './schemas/token.schema';
import { AuthorizationCodeSchema } from './schemas/authCode.schema';

@Module({
  imports: [
    OAuth2ServerModule.forRoot({
      accessTokenLifetime: 60 * 60 * 24, // 1 day
      allowBearerTokensInQueryString: true,
      allowEmptyState: true,
      authorizationCodeLifetime: 5 * 60, // 50 minutes
      refreshTokenLifetime: 60 * 60 * 24 * 7, // 1 week
      requireClientAuthentication: true,
    }),
    MongooseModule.forFeature([
      { name: 'client', schema: OAuth2ClientSchema },
      { name: 'accesstoken', schema: AccessTokenSchema },
      { name: 'refreshtoken', schema: RefreshTokenSchema },
      { name: 'authCode', schema: AuthorizationCodeSchema },
    ]),
  ],
  controllers: [Oauth2Controller],
  providers: [Oauth2Service],
})
export class Oauth2Module {}

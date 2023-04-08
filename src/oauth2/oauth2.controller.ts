import { Controller, Post } from '@nestjs/common';
import {
  OAuth2Authenticate,
  OAuth2Authorize,
  OAuth2Token,
  OAuth2Authorization,
  OAuth2RenewToken,
} from '@t00nday/nestjs-oauth2-server';
import { of } from 'rxjs';
import { Token, AuthorizationCode } from 'oauth2-server';

@Controller('oauth2')
export class Oauth2Controller {
  @Post('token')
  @OAuth2Authenticate()
  authenticateClient(@OAuth2Token() token: Token) {
    return of(token);
  }

  @Post('authorize')
  @OAuth2Authorize()
  authorizeClient(@OAuth2Authorization() authorization: AuthorizationCode) {
    return of(authorization);
  }

  @Post('refresh')
  @OAuth2RenewToken()
  renewToken(@OAuth2Token() token: Token) {
    return of(token);
  }
}

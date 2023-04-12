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

/**
 * FLOW
 * User requests token
 * - if refresh token && expired => ask for username/password
 * - if first time => ask for password
 * - if refresh token && !expired => grant access token and new refresh token
 * 
 * User inputs password
 * - verify with argon2
 * - if correct, grant tokens
 * 
 * After receiving tokens
 * - get JWT from auth module
 */

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

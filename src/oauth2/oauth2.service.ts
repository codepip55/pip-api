import { Injectable, NotFoundException } from '@nestjs/common';
import { OAuth2Model } from '@t00nday/nestjs-oauth2-server';
import { RequestAuthenticationModel } from 'oauth2-server';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { OAuth2Client, OAuth2ClientDocument } from './schemas/client.schema';
import { AccessTokenDocument, RefreshTokenDocument, } from './schemas/token.schema';
import { User } from 'src/users/schemas/users.schema';
import { AuthorizationCodeDocument } from './schemas/authCode.schema';

@Injectable()
@OAuth2Model()
export class Oauth2Service implements RequestAuthenticationModel {
  constructor(
    @InjectModel('accesstoken') private accessModel: Model<AccessTokenDocument>,
    @InjectModel('refreshtoken') private refreshModel: Model<RefreshTokenDocument>,
    @InjectModel('authcode') private authCodeModel: Model<AuthorizationCodeDocument>,
    @InjectModel('client') private oauthClientModel: Model<OAuth2ClientDocument>
  ) {}

  async getClient(
    clientId: string,
    clientSecret?: string,
  ): Promise<{
    client: {
      id: string;
      redirectUris: string[];
      grants: string[];
    };
  }> {
    console.log('model', this.oauthClientModel)
    try {
      let client;
      if (!clientSecret)
        client = await this.oauthClientModel.findOne({ clientId });
      else
        client = await this.oauthClientModel.findOne({
          clientId,
          clientSecret,
        });
      if (!client) throw new NotFoundException();

      return {
        client: {
          id: client.clientId,
          redirectUris: client.redirectUris,
          grants: client.clientGrants,
        },
      };
    } catch (err) {
      console.log(1, err);
    }
  }

  async saveToken(
    token: {
      accessToken: string;
      accessTokenExpiresAt: Date;
      refreshToken: string;
      refreshTokenExpiresAt: Date;
      scope: string;
    },
    client: OAuth2Client,
    user: User,
  ): Promise<{
    token: {
      accessToken: string;
      accessTokenExpiresAt: Date;
      refreshToken: string;
      refreshTokenExpiresAt: Date;
      scope: string[];
      client: {
        id: string;
      };
      user: User;
    };
  }> {
    const savedAccessToken = await new this.accessModel({
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      client,
      user,
      scope: token.scope,
    }).save();

    const savedRefreshToken = await new this.refreshModel({
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      client,
      user,
    }).save();

    return {
      token: {
        accessToken: savedAccessToken.accessToken,
        accessTokenExpiresAt: savedAccessToken.accessTokenExpiresAt,
        refreshToken: savedRefreshToken.refreshToken,
        refreshTokenExpiresAt: savedRefreshToken.refreshTokenExpiresAt,
        scope: savedAccessToken.scope,
        client: {
          id: savedAccessToken.client.clientId,
        },
        user: savedAccessToken.user,
      },
    };
  }

  async saveAuthorizationCode(
    code: {
      authorizationCode: string;
      expiresAt: Date;
      redirectUri: string;
      scope?: string;
    },
    client: OAuth2Client,
    user: User,
  ): Promise<{
    code: {
      authorizationCode: string;
      expiresAt: Date;
      redirectUri: string;
      scope: string;
      client: {
        id: string;
      };
      user: User;
    };
  }> {
    const savedAuthCode = await new this.authCodeModel({
      authorizationCode: code.authorizationCode,
      expiresAt: code.expiresAt,
      redirectUri: code.redirectUri,
      scope: code.scope,
      client,
      user,
    }).save();

    return {
      code: {
        authorizationCode: savedAuthCode.authorizationCode,
        expiresAt: savedAuthCode.expiresAt,
        redirectUri: savedAuthCode.redirectUri,
        scope: savedAuthCode.scope,
        client: {
          id: savedAuthCode.client.clientId,
        },
        user: savedAuthCode.user,
      },
    };
  }

  async revokeAuthorizationCode(code: string): Promise<boolean> {
    const authCode = await this.authCodeModel
      .findOneAndDelete({ authorizationCode: code })
      .exec();
    if (!authCode) return false;

    return true;
  }

  validateScope(
    token: {
      accessToken: string;
      client: {
        id: string;
      };
      user: User;
      scope: string;
    },
    scope: string,
  ) {
    if (!token.scope) return false;

    const requiredScopes = scope.split(' ');
    const authorizedScopes = token.scope.split(' ');
    return requiredScopes.every((s) => authorizedScopes.indexOf(s) >= 0);
  }

  async getAuthorizationCode(authorizationCode: string): Promise<{
    code: {
      code: string;
      expiresAt: Date;
      redirectUri: string;
      scope: string;
      client: {
        id: string;
      };
      user: User;
    };
  }> {
    const code = await this.authCodeModel.findOne({ authorizationCode });
    if (!code) throw new NotFoundException();

    return {
      code: {
        code: code.authorizationCode,
        expiresAt: code.expiresAt,
        redirectUri: code.redirectUri,
        scope: code.scope,
        client: {
          id: code.client.clientId,
        },
        user: code.user,
      },
    };
  }

  async getRefreshToken(refreshToken: string): Promise<{
    token: {
      refreshToken: string;
      refreshTokenExpiresAt: Date;
      client: {
        id: string;
      };
      user: User;
    };
  }> {
    const token = await this.refreshModel.findOne({ refreshToken });
    if (!token) throw new NotFoundException();

    return {
      token: {
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        client: {
          id: token.client.clientId,
        },
        user: token.user,
      },
    };
  }

  async revokeToken(token: {
    refreshToken: string;
    refreshTokenExpiresAt?: Date;
    scope?: string;
  }): Promise<boolean> {
    const refreshToken = await this.refreshModel.findOneAndDelete({
      refreshToken: token.refreshToken,
    });
    if (!refreshToken) return false;
    return true;
  }

  async getAccessToken(accessToken: string): Promise<{
    accessToken: string,
    accessTokenExpiresAt: Date,
    scope: string[],
    client: {
      id: string
    },
    user: User
  }> {
    const token = await this.accessModel.findOne({ accessToken });
    if (!token) throw new NotFoundException();

    return {
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      scope: token.scope,
      client: {
        id: token.client.clientId,
      },
      user: token.user,
    };
  }
}

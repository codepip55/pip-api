import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { add } from "date-fns";
import * as crypto from 'crypto';
import * as argon from 'argon2';

import { AuthorizationCode, AuthorizationCodeDocument } from "./schemas/authCode.schema";
import { OAuth2Client } from "./schemas/client.schema";
import { User, UserDocument } from "src/users/schemas/users.schema";
import { AccessToken, RefreshToken, RefreshTokenDocument } from "./schemas/token.schema";

@Injectable()
export class Oauth2Service {
  constructor(
    @InjectModel('authcode') private authCodeModel: Model<AuthorizationCodeDocument>,
    @InjectModel('client') private clientModel: Model<OAuth2Client>,
    @InjectModel('accesstoken') private accessTokenModel: Model<AccessToken>,
    @InjectModel('refreshtoken') private refreshTokenModel: Model<RefreshTokenDocument>,
    @InjectModel('user') private userModel: Model<UserDocument>
  ) {}

  // Utils
  generateRandomToken(length: number = 80) {
    return crypto.randomBytes(length * 2).toString("hex")
  }

  // Authorization Code

  async findAuthCode(code: string): Promise<AuthorizationCode> {
    const authCode = await this.authCodeModel.findOne({ authorizationCode: code })
    if (!authCode) return null;
    return authCode;
  }

  async createAuthCode(client: OAuth2Client, user: User, scopes: string[], redirectUri: string): Promise<AuthorizationCode> {
    const newCode = new this.authCodeModel({
      authorizationCode: this.generateRandomToken(),
      expiresAt: add(new Date(), {
        minutes: 15
      }),
      redirectUri,
      scopes,
      client,
      user
    });
    return newCode.save();
  }

  async revokeAuthCode(code: string): Promise<AuthorizationCode> {
    const authCode = this.authCodeModel.findOneAndDelete({ authorizationCode: code })
    return authCode;
  }

  // Clients

  async findClient(clientId: string, clientSecret?: string): Promise<OAuth2Client> {
    if (clientSecret) {
      const client = await this.clientModel.findOne({ clientId, clientSecret })
      if (!client) throw new NotFoundException();
      return client;
    }

    const client = await this.clientModel.findOne({ clientId })
    if (!client) throw new NotFoundException();
    return client;
  }

  // Access Tokens

  async findAccessToken(token: string): Promise<AccessToken> {
    const at = await this.accessTokenModel.findOne({ accessToken: token })
    if (!at) null;
    return at;
  }

  async createAccessToken(
    client: OAuth2Client,
    scopes: string[],
    user: User
  ): Promise<AccessToken> {
    const newToken = new this.accessTokenModel({
      accessToken: this.generateRandomToken(),
      accessTokenExpiresAt: add(new Date(), {
        hours: 2
      }),
      client,
      user,
      scopes
    })
    return newToken.save()
  }

  async revokeAccessToken(token: string): Promise<AccessToken> {
    const at = await this.accessTokenModel.findOneAndDelete({ accessToken: token })
    if (!at) throw new NotFoundException();
    return at;
  }

  async revokeAllUsersAccessTokens(user: User): Promise<void> {
    await this.accessTokenModel.deleteMany({ user })
  }

  // Refresh Tokens
  
  async findRefreshToken(token: string): Promise<RefreshToken> {
    const rt = await this.refreshTokenModel.findOne({ refreshToken: token })
    if (!rt) null;
    return rt;
  }

  async createRefreshToken(
    client: OAuth2Client,
    user: User,
    scopes: string[]
  ): Promise<RefreshToken> {
    const newToken = new this.refreshTokenModel({
      refreshToken: this.generateRandomToken(),
      refreshTokenExpiresAt: add(new Date(), {
        days: 7
      }),
      client,
      user,
      scopes
    })
    return newToken.save()
  }

  async revokeRefreshToken(token: string): Promise<RefreshToken> {
    const rt = await this.refreshTokenModel.findOneAndDelete({ refreshToken: token })
    if (!rt) throw new NotFoundException();
    return rt;
  }

  async revokeAllUsersRefreshTokens(user: User): Promise<void> {
    await this.refreshTokenModel.deleteMany({ user })
  }

  // Login

  async verifyPassword(email: string, password: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email })
    return await argon.verify(user.password, password)
  }
}

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';

import { UsersService } from 'src/users/users.service';

@Injectable()
export class PipAuthStrategy extends PassportStrategy(Strategy, 'pc-auth') {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private http: HttpService,
  ) {
    super({
      authorizationURL: configService.get<string>('PC_LOGIN_URL'),
      tokenURL: configService.get<string>('PC_TOKEN_URL'),
      clientID: configService.get<string>('PC_CLIENT_ID'),
      clientSecret: configService.get<string>('PC_CLIENT_SECRET'),
      callbackURL: configService.get<string>('PC_REDIRECT_URI'),
      scope: 'full_name email custom_email details',
    });
  }

  async validate(accessToken: string, refreshToken: string): Promise<any> {
    const userURL = this.configService.get<string>('PC_USER_URI');
    const user$ = this.http.get(userURL, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const response = await firstValueFrom(user$);

    // Update user or create if none exists
    let user = null;
    try {
      user = await this.usersService.findById(response.data.data._id);
    } catch (err) {
      throw err;
    }

    return { user, refreshToken };
  }

  authenticate(req: Request, options: any): any {
    const { state } = req.query;
    super.authenticate(req, { ...options, state });
  }
}

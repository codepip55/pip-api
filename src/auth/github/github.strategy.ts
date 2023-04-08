import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-oauth2';
import { firstValueFrom } from 'rxjs';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private http: HttpService,
    private usersService: UsersService,
  ) {
    super({
      authorizationURL: configService.get<string>('GITHUB_LOGIN_URL'),
      tokenURL: configService.get<string>('GITHUB_TOKEN_URL'),
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      redirectUri: configService.get<string>('GITHUB_REDIRECT_URI'),
      scope: 'read:user user:email',
      state:
        'pc_redirect_' +
        Math.random()
          .toString(36)
          .replace(/[^a-z]+/g, ''),
    });
  }

  async validate(accessToken: string, refreshToken: string): Promise<any> {
    const userURL = this.configService.get<string>('GITHUB_USER_URI');
    const user$ = this.http.get(userURL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const response = await firstValueFrom(user$);

    // Update user or create one if none exists
    let user = null;
    try {
      user = await this.usersService.findByGhId(response.data.id);
      user = await this.usersService.findByGhIdAndUpdate(response);
    } catch (err) {
      if (err instanceof NotFoundException) {
        user = await this.usersService.createUser(response);
      } else {
        throw err;
      }
    }

    return { user, refreshToken };
  }

  async authenticate(req: Request, options: any): Promise<any> {
    const { state } = req.query;
    super.authenticate(req, { ...options, state });
  }
}

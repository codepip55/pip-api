import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private jwtService: JwtService,
    private http: HttpService,
    private usersService: UsersService,
  ) {}

  getTokens(user: any) {
    const payload = { sub: user.user._id };

    const refreshToken = user.refreshToken;
    delete user.refreshToken;

    return {
      token: this.jwtService.sign(payload),
      expiresIn: 30 * 60 * 1000,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.config.get<string>('GITHUB_CLIENT_ID'),
      client_secret: this.config.get<string>('GITHUB_CLIENT_SECRET'),
      refresh_token: refreshToken,
    });

    const tokenURL = this.config.get<string>('GITHUB_TOKEN_URL');
    const $creds = this.http.post(tokenURL, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
    });

    let creds: any;
    try {
      creds = (await firstValueFrom($creds)).data;
    } catch (err) {
      throw new UnauthorizedException();
    }

    const userURL = this.config.get<string>('GITHUB_USER_URI');
    const $user = this.http.get(userURL, {
      headers: {
        Authorization: `Bearer ${creds.access_token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    try {
      const ssoUser = (await firstValueFrom($user)).data;
      const user = await this.usersService.findByGhId(ssoUser.id);

      console.log({
        user,
        token: this.jwtService.sign({ sub: user.id }),
        expiresIn: 30 * 60 * 1000, // 30 min
        newRefreshToken: creds.refresh_token,
      });

      return {
        user,
        token: this.jwtService.sign({ sub: user.id }),
        expiresIn: 30 * 60 * 1000, // 30 min
        newRefreshToken: creds.refresh_token,
      };
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}

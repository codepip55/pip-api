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

  async login(username: string, password: string) {
    let user = await this.http.post(`${this.config.get<string>('CMS_URL')}/auth/local`, {
      identifier: username,
      password
    })

    return user
  }
}

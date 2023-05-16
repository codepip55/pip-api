import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';

@ApiBearerAuth()
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('login')
  login(@Body() body: {
    username: string,
    password: string
  }) {
    return this.authService.login(body.username, body.password)
  }

}

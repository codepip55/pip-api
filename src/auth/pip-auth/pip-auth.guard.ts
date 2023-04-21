import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class PipAuthGuard extends AuthGuard('pc-auth') {}

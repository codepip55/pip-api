import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const perms = this.reflector.get<string[]>('perms', context.getHandler());
    if (perms.length == 0) return true;

    const { user } = context.switchToHttp().getRequest();
    return perms.every((perm) => user.member.perms.includes(perm));
  }
}

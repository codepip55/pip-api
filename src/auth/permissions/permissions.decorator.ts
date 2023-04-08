import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RoleGuard } from '../role.guard';

export const RequirePerms = (...perms: string[]) =>
  applyDecorators(
    SetMetadata('perms', perms),
    UseGuards(JwtAuthGuard, RoleGuard),
  );

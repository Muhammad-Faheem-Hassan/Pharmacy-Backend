
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class RolesGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  handleRequest(err, user, info: Error, context: ExecutionContext) {    
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());
    if (isPublic) {
      return user || null;
    }
    
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    if (user.role && user.role ===  "admin") {
      return user;
    }
    
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
    const hasPermission = () => user.permissions.some((permission: string) => requiredPermissions.includes(permission));
    if (requiredPermissions && requiredPermissions.length && !hasPermission()) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return user;
  }
}

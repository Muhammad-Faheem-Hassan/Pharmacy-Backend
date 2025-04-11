import { IJwtPayload } from './../interfaces/jwt-payload.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { RoleService } from 'src/role/role.service';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService, private readonly authService: AuthService, private readonly roleService: RoleService,) {
    super({
      jwtFromRequest: authService.returnJwtExtractor(),
      ignoreExpiration: false,
      secretOrKey: configService.get("jwtSecret"),
    });
  }

  async validate(jwtPayload: IJwtPayload) {
    try {
      const user = await this.authService.validateUser(jwtPayload);      
      if (!user) {
        return false;
      }
  
      user.permissions = [];
      const role = await this.roleService.findOneCached(user.RoleId.toString());
      if (role) {
        user.role = role.identifier;
        user.permissions = role.permissions;
      }
      return user;
    } catch (error) {
      return false;      
    }
  }
}

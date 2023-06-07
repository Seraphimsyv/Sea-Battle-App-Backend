import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from 'src/modules/users/users.service';
import { jwtConstants } from 'src/constants';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/modules/auth/auth.service';
 
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
        // From headers
        return request.headers.authorization;
        // From cookies
        return request?.cookies?.Authentication;
      }]),
      secretOrKey: jwtConstants.secret
    });
  }
 
  async validate(payload: { access_token: string }) {
    if (payload?.access_token) {
      const user = await this.authService.getUserFromToken(payload.access_token);
      return this.userService.getById(user['id']);
    } else {
      return this.userService.getById(payload['id']);
    }
  }
}
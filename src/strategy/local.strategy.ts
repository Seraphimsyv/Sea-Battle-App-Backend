import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import { User } from 'src/entities/users.entity';
 
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'login'
    });
  }
  /**
   * 
   * @param email 
   * @param password 
   * @returns 
   */
  async validate(login: string, password: string): Promise<User> {
    return this.authService.validateUser({ login: login, password: password });
  }
}
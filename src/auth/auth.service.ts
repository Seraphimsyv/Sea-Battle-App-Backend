import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/users.entity';
import {
  Registration,
  Validation
} from './types'


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}
  /**
   * Getting a user through a token
   * @param token 
   * @returns 
   */
  async getUserFromToken(token: string) {
    const user = this.jwtService.decode(token);
    
    return user;
  }
  /**
   * User Validation
   * @param login 
   * @param pass 
   */
  async validateUser(validateData: Validation): Promise<any> {
    const user = await this.usersService.findOne(validateData.login);
    if (user && user.password === validateData.password) {
      const { password, ...result } = user;

      return result;
    }

    return null;
  }
  /**
   * User authorization
   * @param user 
   * @returns 
   */
  async autorizationUser(user: User) {
    const payload = { login: user.login, id: user.id, username: user.username };

    return {
      access_token: this.jwtService.sign(payload)
    };
  }
  /**
   * User registration
   * @param userData 
   * @returns 
   */
  async registrationUser(userData: Registration) {
    return this.usersService.createUser(userData);
  }
}
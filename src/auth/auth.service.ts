import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/users.entity';
import {
  ValidationDtoData,
  RegistrationDtoData
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}
  /**
   * 
   * @param token 
   * @returns 
   */
  async getUserFromToken(token: string) {
    const user = this.jwtService.decode(token);
    
    return user;
  }
  /**
   * 
   * @param login 
   * @param pass 
   * @returns 
   */
  async validateUser(validateData: ValidationDtoData): Promise<any> {
    const user = await this.usersService.findOne(validateData.login);
    if (user && user.password === validateData.password) {
      const { password, ...result } = user;

      return result;
    }

    return null;
  }
  /**
   * 
   * @param user 
   * @returns 
   */
  async autorizationUser(user: User) {
    const payload = { login: user.login, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload)
    };
  }
  /**
   * 
   * @param userData 
   * @returns 
   */
  async registrationUser(userData: RegistrationDtoData) {
    return this.usersService.createUser(userData);
  }
}
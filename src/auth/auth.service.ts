import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/users.entity';

type Token = string;

type ValidationData = {
  username: string,
  password: string
};

type RegistrationData = {
  username: string,
  login: string,
  password: string
};

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
  async getUserFromToken( token: Token ) {
    const user = this.jwtService.decode(token);
    return user;
  }
  /**
   * 
   * @param username 
   * @param pass 
   * @returns 
   */
  async validateUser( validateData: ValidationData ): Promise<any> {
    const user = await this.usersService.findOne(validateData.username);
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
  async autorizationUser( user: User ) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload)
    };
  }
  /**
   * 
   * @param userData 
   * @returns 
   */
  async registrationUser( userData: RegistrationData ) {
    return this.usersService.createUser(userData);
  }
}
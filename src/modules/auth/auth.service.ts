import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/users.entity';
import {
  AuthData,
  RegisterData
} from 'src/types/auth.types';
import { HttpException } from '@nestjs/common/exceptions';
import { HttpStatus } from '@nestjs/common/enums';

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
    return this.jwtService.decode(token);
  }
  /**
   * User Validation
   * @param login 
   * @param pass 
   */
  async validateUser(authData: AuthData): Promise<any> {
    const user = await this.usersService.findOne(authData.login);
    
    if (!user) {
      throw new HttpException(
        'Sorry, but the user does not exist. Please double-check the entered data or register to create an account.',
        HttpStatus.UNAUTHORIZED
      )
    }

    if (user && user.password !== authData.password) {
      throw new HttpException(
        'Sorry, but the password entered is incorrect. Please make sure you enter the correct credentials and try again.',
        HttpStatus.UNAUTHORIZED
      )
    }

    if (user && user.password === authData.password) {
      return {
        ...user,
        password: undefined
      };
    }

    throw new HttpException(
      'Sorry, there was an error logging into the website. Please check your credentials and try again.',
      HttpStatus.UNAUTHORIZED
    );
  }
  /**
   * User authorization
   * @param user 
   * @returns 
   */
  async autorizationUser(user: User) {
    const payload = { login: user.login, id: user.id, username: user.username };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }
  /**
   * User registration
   * @param data 
   * @returns 
   */
  async registrationUser(registerData: RegisterData) {
    return this.usersService.createUser(registerData);
  }
}
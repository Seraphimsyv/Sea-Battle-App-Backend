import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { Logger } from '@nestjs/common/services';
import { ApiTags, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { 
  LoginDtoData,
  RegistrationDtoData
} from './dto';

@Controller('/api/auth')
@ApiTags('/api/posts')
export class AuthController {
  private readonly logger: Logger = new Logger("AuthController");

  constructor(
    private readonly authService: AuthService
  ) {}
  /**
   * User authorization endpoint
   * @param req 
   */
  @Post('log-in')
  @ApiParam({ 
    name: 'Login',
    required: true,
    description: 'User login',
    type: String
  })
  @ApiParam({ 
    name: 'Password',
    required: true,
    description: 'User password',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Successful user authorization',
    type: String
  })
  @ApiResponse({
    status: 401,
    description: 'User authorization error',
    type: Object
  })
  async logIn(@Body() req: LoginDtoData) {
    const user = await this.authService.validateUser(
      { 
        login: req.login,
        password: req.password
      }
    )

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.authService.autorizationUser(user);
  }
  /**
   * User registration endpoint
   * @param registerData 
   */
  @Post('sign-in')
  @ApiParam({ 
    name: 'Username',
    required: true,
    description: 'User login',
    type: String
  })
  @ApiParam({ 
    name: 'Login',
    required: true,
    description: 'User login',
    type: String
  })
  @ApiParam({ 
    name: 'Password',
    required: true,
    description: 'User password',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Successful user registation',
    type: String
  })
  @ApiResponse({
    status: 401,
    description: 'User registation error',
    type: Object
  })
  async signIn(@Body() registerData: RegistrationDtoData ) {
    return this.authService.registrationUser( registerData );
  }
}
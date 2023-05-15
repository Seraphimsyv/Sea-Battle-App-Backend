import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { Logger } from '@nestjs/common/services';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { 
  LoginDtoData,
  RegistrationDtoData
} from './dto';

@Controller('/api/auth')
export class AuthController {
  private readonly logger: Logger = new Logger("AuthController");

  constructor(
    private readonly authService: AuthService
  ) {}
  /**
   * 
   * @param req 
   * @returns 
   */
  @Post('log-in')
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
   * 
   * @param registerData 
   */
  @Post('sign-in')
  async signIn(@Body() registerData: RegistrationDtoData ) {
    return this.authService.registrationUser( registerData );
  }
}
import {
  Controller,
  Request,
  Post,
  Body,
  UseGuards
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from 'src/guard/local-auth.guard';

type RegistrationDataDto = {
  username: string,
  login: string,
  password: string
}

@Controller('/api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}
  /**
   * 
   * @param req 
   * @returns 
   */
  @UseGuards(LocalAuthGuard)
  @Post('log-in')
  async logIn(@Request() req) {
    // return req.user;
    return this.authService.autorizationUser(req.user);
  }
  /**
   * 
   * @param registerData 
   */
  @Post('sign-in')
  async signIn(@Body() registerData: RegistrationDataDto ) {
    return this.authService.registrationUser( registerData );
  }
}
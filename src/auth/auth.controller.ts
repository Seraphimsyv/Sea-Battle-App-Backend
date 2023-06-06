import {
  Controller,
  UseGuards,
  Request,
  Body,
  Post,
  Get
} from '@nestjs/common';
import { ApiTags, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterUserDto
} from './../dto/auth.dto';
import { LocalAuthenticationGuard } from 'src/guard/localAuth.guard';
import { JwtAuthenticationGuard } from 'src/guard/jwtAuth.guard';

@Controller('/api/auth')
@ApiTags('/api/posts')
export class AuthController {
  
  constructor(
    private readonly authService: AuthService
  ) {}
  /**
   * User authorization endpoint
   * @param req 
   */
  @Post('log-in')
  @UseGuards(LocalAuthenticationGuard)
  async logIn(@Request() req) {
    return this.authService.autorizationUser(req.user);
  }
  /**
   * User registration endpoint
   * @param registerData 
   */
  @Post('sign-in')
  async signIn(@Body() registerUserDto: RegisterUserDto ) {
    return this.authService.registrationUser(registerUserDto);
  }
  /**
   * 
   * @param req 
   * @returns 
   */
  @Get('refresh-token')
  @UseGuards(JwtAuthenticationGuard)
  async updateToken(@Request() req) {
    return this.authService.autorizationUser(req.user);
  }
}
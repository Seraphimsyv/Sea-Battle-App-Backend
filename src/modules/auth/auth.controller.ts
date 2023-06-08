import {
  Controller,
  UseGuards,
  Request,
  Body,
  Post,
  Get
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiBody,
  ApiParam,
  ApiResponse
} from '@nestjs/swagger';
import { HttpException } from '@nestjs/common/exceptions';
import { User } from 'src/entities/users.entity';
import { AuthService } from './auth.service';
import { RegisterUserDto, ResponseLoginDto } from 'src/dto/auth.dto';
import { LocalAuthenticationGuard } from 'src/guard/localAuth.guard';
import { JwtAuthenticationGuard } from 'src/guard/jwtAuth.guard';

@Controller('/api/auth')
@ApiTags('/api/auth')
export class AuthController {
  
  constructor(
    private readonly authService: AuthService
  ) {}
  /**
   * User authorization endpoint
   * @param req 
   */
  @Post('log-in')
  @ApiResponse({
    status: 200,
    description: 'Successfully autorization user!',
    type: ResponseLoginDto
  })
  @ApiResponse({
    status: 401,
    description: 'Authorisation Error!',
    type: HttpException
  })
  @UseGuards(LocalAuthenticationGuard)
  async logIn(@Request() req) {
    return this.authService.autorizationUser(req.user);
  }
  /**
   * User registration endpoint
   * @param registerData 
   */
  @Post('sign-in')
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully registration user!',
    type: Promise<User>
  })
  @ApiResponse({
    status: 400,
    description: 'Registration Error!',
    type: HttpException
  })
  async signIn(@Body() registerUserDto: RegisterUserDto ) {
    return this.authService.registrationUser(registerUserDto);
  }
}
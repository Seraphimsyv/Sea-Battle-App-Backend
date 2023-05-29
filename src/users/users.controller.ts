import {
  Controller,
  Request,
  Body,
  Get,
} from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';

@Controller('api/account')
@ApiTags('api/account')
export class UsersController {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}
  /**
   * Profile retrieval endpoint
   * @param req 
   * @returns 
   */
  @Get('profile')
  @ApiResponse({
    status: 200,
    description: 'Retrieving User Profile Data',
    type: Object
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access',
    type: Object
  })
  async getProfile(@Request() req) {
    const user = this.jwtService.decode(req.headers.authorization);
    
    if(user) {
      return this.usersService.getProfile(user['login']);
    } else {
      throw new UnauthorizedException();
    }
  }
}
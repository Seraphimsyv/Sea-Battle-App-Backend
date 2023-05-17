import {
  Controller,
  Request,
  Get,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';

@Controller('api/account')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}
  /**
   * 
   * @param req 
   * @returns 
   */
  @Get('profile')
  async getProfile(@Request() req) {
    const user = this.jwtService.decode(req.headers.authorization);
    return this.usersService.getProfile(user['login']);
  }
}
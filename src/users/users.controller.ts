import {
  Controller,
  Request,
  Get,
  UseGuards
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';

@Controller('api/account')
export class UsersController {
  constructor(
    private readonly usersService: UsersService
  ) {}
  /**
   * 
   * @param req 
   * @returns 
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.username);
  }
}
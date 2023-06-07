import {
  Controller,
  UseGuards,
  Request,
  Logger,
  Get,
} from '@nestjs/common';
import {
  ApiResponse,
  ApiHeader,
  ApiParam,
  ApiTags
} from '@nestjs/swagger';
import { JwtAuthenticationGuard } from 'src/guard/jwtAuth.guard';
import { UsersService } from './users.service';

@Controller('api/account')
@ApiTags('api/account')
export class UsersController {
  private readonly logger: Logger = new Logger();
  
  constructor(
    private usersService: UsersService
  ) {}
  /**
   * User profile endpoint
   * @param req 
   * @returns 
   */
  @Get('profile')
  @UseGuards(JwtAuthenticationGuard)
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.login);
  }
  /**
   * User statistics game endpoint
   * @param req 
   */
  @Get('statistic')
  @UseGuards(JwtAuthenticationGuard)
  async statistic(@Request() req) {
    return this.usersService.getGamesStatistic(req.user);
  }
  /**
   * User history game endpoint
   * @param req 
   * @returns 
   */
  @Get('history')
  @UseGuards(JwtAuthenticationGuard)
  async history(@Request() req) {
    return this.usersService.getGamesHistory(req.user);
  }
}
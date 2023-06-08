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
  ApiTags
} from '@nestjs/swagger';
import { HttpException } from '@nestjs/common/exceptions';
import { User } from 'src/entities/users.entity';
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
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token'
  })
  @ApiResponse({
    status: 200,
    description: 'Getting a user profile!',
    type: Promise<User>
  })
  @ApiResponse({
    status: 400,
    description: 'Authorization Error!',
    type: HttpException
  })
  @UseGuards(JwtAuthenticationGuard)
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.login);
  }
  /**
   * User statistics game endpoint
   * @param req 
   */
  @Get('statistic')
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token'
  })
  @ApiResponse({
    status: 200,
    description: 'Getting a user game statistic!',
    type: Promise<User>
  })
  @ApiResponse({
    status: 400,
    description: 'Authorization Error!',
    type: HttpException
  })
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
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token'
  })
  @ApiResponse({
    status: 200,
    description: 'Getting a user game history!',
    type: Promise<User>
  })
  @ApiResponse({
    status: 400,
    description: 'Authorization Error!',
    type: HttpException
  })
  @UseGuards(JwtAuthenticationGuard)
  async history(@Request() req) {
    return this.usersService.getGamesHistory(req.user);
  }
}
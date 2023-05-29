import {
  Controller,
  Body,
  Post,
  UnauthorizedException
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags, ApiParam, ApiResponse } from '@nestjs/swagger';
import { WsGameService } from './ws-game.service';
import {
  GameAuthDtoData,
  GameShipDtoData
} from './dto';

@Controller('api/game')
@ApiTags('api/game')
export class WsGameController {
  private logger: Logger = new Logger('WsGameService');
  
  constructor(
    private gameService: WsGameService,
    private jwtService: JwtService
  ) {}
  /**
   * Game Creation Endpoint
   * @param req 
   * @returns 
   */
  @Post('create')
  @ApiParam({ 
    name: 'Token',
    required: true,
    description: 'User token',
    type: String
  })
  @ApiParam({ 
    name: 'Password',
    required: true,
    description: 'Game password',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Successful creation game',
    type: Object
  })
  @ApiResponse({
    status: 401,
    description: 'User authorization error',
    type: Object
  })
  async gameCreate(@Body() req: GameAuthDtoData) {
    if (req.token) {
      const res = await this.gameService.gameCheckExist(req.password);

      if (res === true) {
        return { status: false };
      } else {
        await this.gameService.gameCreate(req.password);
        
        return { status: true };
      }
    } else {
      throw new UnauthorizedException();
    }
  }
  /**
   * The end point of the game's existence
   * @param req 
   * @returns 
   */
  @Post('check-exists')
  @ApiParam({ 
    name: 'Token',
    required: true,
    description: 'User token',
    type: String
  })
  @ApiParam({ 
    name: 'Password',
    required: true,
    description: 'Game password',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Game exists status',
    type: Object
  })
  @ApiResponse({
    status: 401,
    description: 'User authorization error',
    type: Object
  })
  async gameCheckExists(@Body() req: GameAuthDtoData) {
    if (req.token) {
      const res = this.gameService.gameCheckExist(req.password);

      if (res) {
        return { status: true };
      } else {
        return { status: false };
      }
    } else {
      throw new UnauthorizedException();
    }
  }
  /**
   * End point for adding a ship to the game
   * @param req 
   */
  @Post('player-add-ship')
  @ApiParam({ 
    name: 'Token',
    required: true,
    description: 'User token',
    type: String
  })
  @ApiParam({ 
    name: 'Password',
    required: true,
    description: 'Game password',
    type: String
  })
  @ApiParam({ 
    name: 'Ship data',
    required: true,
    description: 'Game ship data',
    type: Object
  })
  @ApiResponse({
    status: 200,
    description: 'Successful adding ship to game',
    type: Object
  })
  @ApiResponse({
    status: 401,
    description: 'User authorization error',
    type: Object
  })
  async playgrounPlayerAddShip(@Body() req: GameShipDtoData) {
    if (req.token) {
      this.gameService.addPlayerShip({
        password: req.password,
        token: req.token,
        point: req.point
      });
    } else {
      throw new UnauthorizedException();
    }
  }
  /**
   * Player readiness endpoint
   * @param req 
   */
  @Post('player-set-ready')
  @ApiParam({ 
    name: 'Token',
    required: true,
    description: 'User token',
    type: String
  })
  @ApiParam({ 
    name: 'Password',
    required: true,
    description: 'Game password',
    type: String
  })
  @ApiResponse({
    status: 401,
    description: 'User authorization error',
    type: Object
  })
  async playgrounPlayerSetReady(@Body() req: GameAuthDtoData) {    
    if (req.token) {
      this.gameService.setPlayerReady({
        password: req.password,
        token: req.token
      });
    } else {
      throw new UnauthorizedException();
    }
  }
  /**
   * User shot validation endpoint
   * @param req 
   */
  @Post('player-check-shot')
  @ApiParam({ 
    name: 'Token',
    required: true,
    description: 'User token',
    type: String
  })
  @ApiParam({ 
    name: 'Password',
    required: true,
    description: 'Game password',
    type: String
  })
  @ApiParam({ 
    name: 'Shot data',
    required: true,
    description: 'Game player shot data',
    type: String
  })
  @ApiResponse({
    status: 401,
    description: 'User authorization error',
    type: Object
  })
  async playgroundPlayerShot(@Body() req: GameShipDtoData) {
    if (req.token) {
      this.gameService.playerShot({
        password: req.password,
        token: req.token,
        point: req.point
      });
    } else {
      throw new UnauthorizedException();
    }
  }
  /**
   * Endpoint for sending a message to a chat
   * @param req 
   */
  @Post('send-message')
  @ApiParam({ 
    name: 'Token',
    required: true,
    description: 'User token',
    type: String
  })
  @ApiParam({ 
    name: 'Password',
    required: true,
    description: 'Game password',
    type: String
  })
  @ApiParam({ 
    name: 'Username',
    required: true,
    description: 'Player username',
    type: String
  })
  @ApiParam({ 
    name: 'Message',
    required: true,
    description: 'Player message',
    type: String
  })
  @ApiResponse({
    status: 401,
    description: 'User authorization error',
    type: Object
  })
  async chatSendMessage(@Body() req: { password: string, token: string, username: string, message: string}) {
    if (req.token) {  
      this.gameService.saveMessage({
        password: req.password,
        message: {
          username: req.username,
          message: req.message
        }
      });
    } else {
      throw new UnauthorizedException();
    }
  }
  /**
   * User statistics and game history endpoint
   * @param req 
   */
  @Post('statistic')
  @ApiParam({ 
    name: 'Token',
    required: true,
    description: 'User token',
    type: String
  })
  @ApiParam({ 
    name: 'Password',
    required: true,
    description: 'Game password',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Obtaining statistics and game history data of the user',
    type: Object
  })
  @ApiResponse({
    status: 401,
    description: 'User authorization error',
    type: Object
  })
  async loadStatistic(@Body() req: { token: string }) {
    this.logger.log('User load statistic: ' + req.token);
    return await this.gameService.loadPlayerStatistic(req.token);
  }
}

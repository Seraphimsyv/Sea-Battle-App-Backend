import {
  Controller,
  Body,
  Post,
  UnauthorizedException
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { WsGameService } from './ws-game.service';
import { JwtService } from '@nestjs/jwt';
import {
  GameAuthDtoData,
  GameShipDtoData
} from './dto';

@Controller('api/game')
export class WsGameController {
  private logger: Logger = new Logger('WsGameService');
  
  constructor(
    private gameService: WsGameService,
    private jwtService: JwtService
  ) {}
  /**
   * 
   * @param req 
   * @returns 
   */
  @Post('create')
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
   * 
   * @param req 
   * @returns 
   */
  @Post('check-exists')
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
   * 
   * @param req 
   */
  @Post('player-add-ship')
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
   * 
   * @param req 
   */
  @Post('player-set-ready')
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
   * 
   * @param req 
   */
  @Post('player-check-shot')
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
   * 
   * @param req 
   */
  @Post('send-message')
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
}
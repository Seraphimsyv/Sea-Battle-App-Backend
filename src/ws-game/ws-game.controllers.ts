import {
  Controller,
  Request,
  Body,
  Post,
} from '@nestjs/common';
import { WsGameService } from './ws-game.service';
import { JwtService } from '@nestjs/jwt';

@Controller('api/game')
export class WsGameController {
  constructor(
    private readonly gameService: WsGameService,
    private readonly jwtService: JwtService
  ) {}
  @Post('game-exists')
  async gameExists(@Body() req: { password: string }) {
  }
}
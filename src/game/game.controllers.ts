import {
  Controller,
  UseGuards,
  Request,
  Body,
  Post,
  Get,
} from '@nestjs/common';
import {
  ApiResponse,
  ApiHeader,
  ApiParam,
  ApiTags
} from '@nestjs/swagger';
import {
  ChatNewMessageDto,
  CreateDto,
  GameShotDto,
  GameShipDto,
  GameDto,
  ConnectDto,
  ChatGetMessagesDto
} from 'src/dto/game.dto';
import { JwtAuthenticationGuard } from 'src/guard/jwtAuth.guard';
import { GameService } from './game.service';

@Controller('api/game')
@ApiTags('api/game')
export class GameController {
  
  constructor(
    private gameService: GameService,
  ) {}

  @Get('load-games')
  @UseGuards(JwtAuthenticationGuard)
  async loadGames() {
    return this.gameService.getAll();
  }
  /**
   * 
   * @param req 
   * @returns 
   */
  @Post('create')
  @UseGuards(JwtAuthenticationGuard)
  async create(
    @Body() createDto: CreateDto
  ) {
    return await this.gameService.create(
      createDto.name, createDto.privacy, createDto.password
    );
  }
  /**
   * 
   * @param body 
   * @param req 
   * @returns 
   */
  @Post('connect')
  @UseGuards(JwtAuthenticationGuard)
  async connect(
    @Request() req,
    @Body() connectDto: ConnectDto
  ) {
    await this.gameService.checkGame(connectDto.gameId);
    return this.gameService.connect(req.user, connectDto.gameId, connectDto.password);
  }
  /**
   * 
   * @param req 
   * @returns 
   */
  @Post('check')
  @UseGuards(JwtAuthenticationGuard)
  async check(@Body() gameDto: GameDto) {
    return await this.gameService.checkGame(gameDto.gameId);
  }
  /**
   * 
   * @param body 
   */
  @Post('update-status')
  @UseGuards(JwtAuthenticationGuard)
  async updatePlayerStatus(
    @Body() gameDto: GameDto,
    @Request() req
  ) {
    return this.gameService.updatePlayerStatusReady(gameDto.gameId, req.user.id);
  }
  /**
   * 
   * @param body 
   */
  @Post('add-ship')
  @UseGuards(JwtAuthenticationGuard)
  async addShip(
    @Body() gameShipDto: GameShipDto,
    @Request() req
  ) {
    return this.gameService.uploadShips(gameShipDto.gameId, req.user, gameShipDto.ships);
  }
  /**
   * 
   * @param body 
   */
  @Post('check-shot')
  @UseGuards(JwtAuthenticationGuard)
  async checkShot(
    @Body() gameShotDto: GameShotDto,
    @Request() res
  ) {
    return this.gameService.checkShot(gameShotDto.gameId, res.user.id, gameShotDto.location);
  }
  /**
   * 
   * @param req 
   * @param body 
   * @returns 
   */
  @Post('send-message')
  @UseGuards(JwtAuthenticationGuard)
  async sendMessage(
    @Request() req,
    @Body() chatNewMessageDto: ChatNewMessageDto
  ) {
    return await this.gameService.sendMessage(req.user, chatNewMessageDto);
  }
  /**
   * 
   * @param body 
   * @returns 
   */
  @Get('get-messages')
  @UseGuards(JwtAuthenticationGuard)
  async getMessages(
    @Request() req,
    @Body() chatGetMesssageDto: ChatGetMessagesDto
  ) {
    return await this.gameService.loadMessages(req.user, chatGetMesssageDto);
  }
}

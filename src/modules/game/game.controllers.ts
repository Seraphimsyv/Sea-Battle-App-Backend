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
  ApiTags,
  ApiBody
} from '@nestjs/swagger';
import { HttpException } from '@nestjs/common/exceptions';
import {
  ChatNewMessageDto,
  CreateDto,
  GameShotDto,
  GameShipDto,
  GameDto,
  ConnectDto,
  ResponseGamePlayerUploadDto,
  ResponseGamePlayerStatusDto,
  ResponseGamePlayerShotDto,
  ResponseChatSendingDto,
  ResponseGameConnectDto,
  ResponseGameCreateDto,
  ResponseGameCheckDto,
  ResponseGameListDto,
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
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token'
  })
  @ApiResponse({
    status: 200,
    description: 'Loading a active game list!',
    type: ResponseGameListDto
  })
  @ApiResponse({
    status: 400,
    description: 'Authorization Error!',
    type: HttpException
  })
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
  @ApiBody({ type: CreateDto })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully game creating!',
    type: ResponseGameCreateDto
  })
  @ApiResponse({
    status: 400,
    description: 'Authorization Error!',
    type: HttpException
  })
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
  @ApiBody({ type: ConnectDto })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully game connection!',
    type: ResponseGameConnectDto
  })
  @ApiResponse({
    status: 400,
    description: 'Authorization Error!',
    type: HttpException
  })
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
  @ApiBody({ type: GameDto })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully game connection!',
    type: ResponseGameCheckDto
  })
  @ApiResponse({
    status: 400,
    description: 'Authorization Error!',
    type: HttpException
  })
  @UseGuards(JwtAuthenticationGuard)
  async check(@Body() gameDto: GameDto) {
    return await this.gameService.checkGame(gameDto.gameId);
  }
  /**
   * 
   * @param body 
   */
  @Post('update-status')
  @ApiBody({ type: GameDto })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully updating player status!',
    type: ResponseGamePlayerStatusDto
  })
  @ApiResponse({
    status: 400,
    description: 'Authorization Error!',
    type: HttpException
  })
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
  @ApiBody({ type: GameShipDto })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully uploading player ship!',
    type: ResponseGamePlayerUploadDto
  })
  @ApiResponse({
    status: 400,
    description: 'Authorization Error!',
    type: HttpException
  })
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
  @ApiBody({ type: GameShotDto })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully shot calculation!',
    type: ResponseGamePlayerShotDto
  })
  @ApiResponse({
    status: 400,
    description: 'Authorization Error!',
    type: HttpException
  })
  @ApiResponse({
    status: 403,
    description: 'Opponents game turn!',
    type: HttpException
  })
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
  @ApiBody({ type: ChatNewMessageDto })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT token'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully send message to game chat!',
    type: ResponseChatSendingDto
  })
  @ApiResponse({
    status: 400,
    description: 'Authorization Error!',
    type: HttpException
  })
  @ApiResponse({
    status: 403,
    description: 'Opponents game turn!',
    type: HttpException
  })
  @UseGuards(JwtAuthenticationGuard)
  async sendMessage(
    @Request() req,
    @Body() chatNewMessageDto: ChatNewMessageDto
  ) {
    return await this.gameService.sendMessage(req.user, chatNewMessageDto);
  }
}

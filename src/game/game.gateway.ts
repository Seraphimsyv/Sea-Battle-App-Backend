import { 
  WebSocketGateway,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { GameService } from './game.service';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { EnumPlayerStatus } from 'src/enum/game.enum';

@WebSocketGateway(
  {
    path: '/api/ws/game'
  }
)
export class GameGateway implements OnGatewayInit {
  private readonly logger: Logger = new Logger('GameGateway');
  private readonly connectedGameClients: Map<string, NodeJS.Timer> = new Map();
  private readonly connectedChatClients: Map<string, NodeJS.Timer> = new Map();

  constructor(
    private readonly gameService: GameService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}
  /**
   * Socket initialization
   */
  afterInit(server: any) {
    this.logger.log('WsGameGateway initialized');
  }
  /**
   * Client socket connections
   * @param client 
   */
  handleConnection(client: Socket) {
    this.logger.log('Client connected: ' + client.id);
  }
  /**
   * 
   * @param client
   * @param gameId 
   */
  @SubscribeMessage('joinGame')
  handleJoin(client: Socket, payload: { gameId: string, playerId: number }) {
    console.log('Clinet joined to game: ' + payload.gameId);
    this.gameService.updatePlayerStatusPreparation(payload.gameId, payload.playerId)
    setInterval(() => {
      client.emit('gameInfo', this.gameService.getGameInfo(payload.gameId))
    }, 1000)
  }

  @SubscribeMessage('leaveGame')
  handleLeave(client: Socket, payload: { gameId: string }) {

  }

  @SubscribeMessage('shoot')
  handleShoot(client: Socket, payload: { gameId: string, shoot: { x: number, y: number } }) {

  }
}

import { 
  WebSocketGateway,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { GameService } from './game.service';
import { AuthService } from 'src/modules/auth/auth.service';
import { UsersService } from 'src/modules/users/users.service';
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
  handleJoinGame(client: Socket, payload: { gameId: string, playerId: number }) {
    console.log('Clinet joined to game: ' + client.id);
    this.gameService.updatePlayerStatusPreparation(payload.gameId, payload.playerId)
    setInterval(() => {
      client.emit('gameInfo', this.gameService.getGameInfo(payload.gameId))
    }, 1000)
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(client: Socket, payload: { gameId: string }) {
    console.log('Client joined to chat: ' + client.id);
    setInterval(() => {
      client.emit('updateChat', { messages: this.gameService.loadMessages(payload.gameId) });
    }, 1000)
  }
}

import { 
  WebSocketServer,
  WebSocketGateway,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsGameService } from './ws-game.service';
import {
  WebSocketConnectionDto
} from './dto'

@WebSocketGateway(
  {
    path: '/api/ws/game'
  }
)
export class WsGameGateway implements OnGatewayInit {
  private logger: Logger = new Logger('WsGameGateway');
  private connectedClients: Map<string, any> = new Map();
  /**
   * 
   * @param gameService 
   */
  constructor(
    private readonly gameService: WsGameService,
  ) {}
  /**
   * 
   */
  @WebSocketServer()
  server: Server;
  /**
   * 
   * @param server 
   */
  afterInit(server: any) {
    this.logger.log('WsGameGateway initialized');
  }
  /**
   * 
   * @param client 
   */
  handleConnection(client: Socket) {
    this.logger.log('Client connected: ' + client.id);
  }
  /**
   * 
   * @param client 
   */
  handleDisconnect(client: Socket) {
    clearInterval(this.connectedClients.get(client.id));
    this.gameService.gameAutoClear();
    this.connectedClients.delete(client.id);
    this.logger.log('Client disconnected: ' + client.id);
  }
  /**
   * 
   * @param client 
   * @param payload 
   */
  @SubscribeMessage('game:connect')
  handleConnectToGame(client: Socket, payload: WebSocketConnectionDto) {
    const connect = this.gameService.gameConnect({
      socket: client,
      password: payload.password,
      token: payload.token
    });

    if (connect) {
      this.logger.log('Client connected to game: ' + client.id);

      const interval = setInterval(() => {
        if (!this.gameService.gameCheckExist(payload.password)) {
          clearInterval(interval);
          return;
        }

        const playerPoints = this.gameService.gameGetPlayersPoints({
          password: payload.password, token: payload.token
        });
        const points = this.gameService.gameGetShipsPoints({
          password: payload.password, token: payload.token
        });
        const gameTurn = this.gameService.gameGetTurn({
          password: payload.password, token: payload.token
        });
        const gameStatus = this.gameService.gameGetStatus(payload.password);
        const opponentStatus = this.gameService.getOpponentStatus({
          password: payload.password, token: payload.token
        });
        const messages = this.gameService.getMessages(payload.password);

        if (points) {
          client.emit('response:game:points', { ...points });
        }
        client.emit('response:game:event-turn', { turn: gameTurn });
        client.emit('response:game:get-status', { ...gameStatus });
        client.emit('response:player:points', { ...playerPoints });
        client.emit('response:opponent:get-status', { ...opponentStatus });
        client.emit('response:messages', { messages: messages });
      }, 1000);

      this.connectedClients.set(client.id, interval);
    } else {
      client.emit('response:error:connect');
    }
  }
}

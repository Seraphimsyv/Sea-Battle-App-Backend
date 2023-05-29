import { 
  WebSocketGateway,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsGameService } from './ws-game.service';
import {
  GameAuthDtoData
} from './dto'
import { EnumGameStatus } from './enum';

@WebSocketGateway(
  {
    path: '/api/ws/game'
  }
)
export class WsGameGateway implements OnGatewayInit {
  private logger: Logger = new Logger('WsGameGateway');
  private connectedGameClients: Map<string, NodeJS.Timer> = new Map();
  private connectedChatClients: Map<string, NodeJS.Timer> = new Map();

  constructor(
    private gameService: WsGameService,
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
   * Disconnect client from socket
   * @param client 
   */
  handleDisconnect(client: Socket) {
    clearInterval(this.connectedGameClients.get(client.id));
    clearInterval(this.connectedChatClients.get(client.id));
    this.gameService.gamePlayerLeave(client);
    this.connectedGameClients.delete(client.id);
    this.connectedChatClients.delete(client.id);
    this.logger.log('Client disconnected: ' + client.id);
  }
  /**
   * Subscribing a client to a game socket
   * @param client 
   * @param payload 
   */
  @SubscribeMessage('game:connect')
  handleConnectToGame(client: Socket, payload: GameAuthDtoData) {
    const connect = this.gameService.gameConnect({
      socket: client,
      password: payload.password,
      token: payload.token
    });

    if (connect) {
      this.logger.log('Client connected to game: ' + client.id);

      const intervalChat = setInterval(() => {
        const messages = this.gameService.getMessages(payload.password); 
        client.emit('response:messages', { messages: messages });
      }, 1000)

      const intervalGame = setInterval(() => {
        const gameStatus = this.gameService.gameGetStatus(payload.password);

        if (gameStatus.status !== false) {
          const playerPoints = this.gameService.gameGetPlayersPoints({
            password: payload.password, token: payload.token
          });
          const points = this.gameService.gameGetShipsPoints({
            password: payload.password, token: payload.token
          });
          const gameTurn = this.gameService.gameGetTurn({
            password: payload.password, token: payload.token
          });
          const opponentStatus = this.gameService.getOpponentStatus({
            password: payload.password, token: payload.token
          });

          client.emit('response:game:event-turn', { turn: gameTurn });
          client.emit('response:game:get-status', { ...gameStatus });
          client.emit('response:player:points', { ...playerPoints });
          client.emit('response:opponent:get-status', { ...opponentStatus });

          if (points) client.emit('response:game:points', { ...points });
        } else {
          clearInterval(intervalGame);
        }

        if (gameStatus.status === EnumGameStatus.FINISHED) {
          clearInterval(intervalGame);
        }

      }, 1000);

      this.connectedGameClients.set(client.id, intervalGame);
      this.connectedChatClients.set(client.id, intervalChat);
    } else {
      client.emit('response:error:connect');
    }
  }
}

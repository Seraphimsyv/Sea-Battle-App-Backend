import { 
  WebSocketGateway,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketServer
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io-client';
import { Server } from 'socket.io';
import { WsGameService } from './ws-game.service';
import {
  Shot,
  Ship
} from './ws-game.types';

@WebSocketGateway(
  {
    path: '/api/ws/game'
  }
)
export class WsGameGateway implements OnGatewayInit {
  private readonly logger: Logger = new Logger('WsGameGateway');
  constructor(
    private readonly gameService: WsGameService,
  ) {}
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
    client.emit('connectResponse', { status: true })
  }
  /**
   * 
   * @param client 
   */
  handleDisconnect(client: Socket) {
    this.logger.log('Client disconnected: ' + client.id);
    this.gameService.delFromGame(client);
  }
  /**
   * 
   * @param client 
   * @param payload 
   */
  @SubscribeMessage('gameConnection')
  handleGameConnection(client: Socket, payload: { password: string, authToken: string } ) {
    this.logger.log('The client connects to the game: ' + client.id);
    const res = this.gameService.addToGame(client, payload.password, payload.authToken);

    if (res === "CONNECTED") {
      client.emit('connectionGameStatus', { status: true, msg: 'Connection alive!' });
    }

    if (res === "GAME_CREATED") {
      client.emit('connectionGameStatus', { status: true, msg: 'Game created and connection succesful!'});
    }
    
    if (res === "CONNECTION_TO_GAME") {
      client.emit('connectionGameStatus', { status: true, msg: "Connected!" });
    }

    if (res === "GAME_ENDED") {
      client.emit('connectionGameStatus', { status: false, msg: 'Game ended!' });
    }

    if (res === "MAX_PLAYERS") {
      client.emit('connectionGameStatus', { status: false, msg: 'Max players!' });
    }
  }
  /**
   * 
   * @param client 
   * @param payload 
   */
  @SubscribeMessage('playgroundAddShip')
  handleAddShip(client: Socket, payload: { password: string, ship: Ship }) {
    this.logger.log('The player adds a ship to the field: ' + client.id);
    const res = this.gameService.addShip(client, payload.password, payload.ship);

    if (res === 0) {
      this.logger.log(`A player tried to add a ship close to another: ${payload.ship}`);
      client.emit('addShipResult', false);
    } else {
      this.logger.log(`The ship is added to the field: ${payload.ship}`);
      client.emit('addShipResult', true);
    }
  }
  /**
   * 
   * @param client 
   * @param payload 
   */
  @SubscribeMessage('playgroundToComplete')
  handleAddShipComplete(client: Socket, payload: { password: string }) {
    this.logger.log('The player has finished setting up the field: ' + client.id);
    this.gameService.completePlayground(client, payload.password);
    const res = this.gameService.checkPlaygrounds(payload.password);

    if (res === 0) {
      this.gameService.games[payload.password].clients.forEach(cl => {
        cl.client.emit('PlaygroundStatus', { status: true });
      })
    }

    if (res === 1) {
      this.gameService.games[payload.password].clients.forEach(cl => {
        cl.client.emit('PlaygroundStatus', { status: false, msg: "Playground of second player not ready" });
      })
    }

    if (res === 2) {
      this.gameService.games[payload.password].clients.forEach(cl => {
        cl.client.emit('PlaygroundStatus', { status: false, msg: "Playground of first player not ready" });
      })
    }

    if (res === 3) {
      this.gameService.games[payload.password].clients.forEach(cl => {
        cl.client.emit('PlaygroundStatus', { status: false, msg: "Nobody players not ready" });
      })
    }

    if (res === 4) {
      this.gameService.games[payload.password].clients.forEach(cl => {
        cl.client.emit('PlaygroundStatus', { status: false, msg: "Second player not connected!" });
      })
    }

    if (res === 5) {
      this.gameService.games[payload.password].clients.forEach(cl => {
        cl.client.emit('PlaygroundStatus', { status: false, msg: "Somethins wrong" });
      })
    }
  }
  /**
   * 
   * @param client 
   * @param payload 
   */
  @SubscribeMessage('playgroundShot')
  handlerShot(client: Socket, payload: { password: string, shot: Shot }) {
    this.logger.log('' + client.id);
    const res = this.gameService.shotShip(client, payload.password, payload.shot);

    this.gameService.games[payload.password].clients.forEach(cl => {
      cl.client.emit('shotResult', res);
    })
  }
}

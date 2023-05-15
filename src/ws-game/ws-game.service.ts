import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Socket } from 'socket.io-client';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Game } from 'src/entities/game.entity';
import { 
  EnumPlaygroundStatus,
  EnumPlaygroundEditStatus,
  EnumShipStatus
} from './ws-game.enum';
import {
  Shot,
  Ship,
  GamesRecord
} from './ws-game.types';

@Injectable()
export class WsGameService {
  private readonly logger: Logger = new Logger('WsGameService');
  public readonly games: GamesRecord = {};

  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}
  /**
   * 
   * @param client 
   */
  delFromGame(client: Socket) {
    for (const password in this.games) {
      if (client === this.games[password].clients[0].client) {
        this.games[password].clients.splice(0, 1);
      } else {
        this.games[password].clients.splice(1, 1);
      }

      if (this.games[password].clients.length === 0) {
        delete this.games[password];
      }
    }
  }
  /**
   * 
   * @param client 
   * @param password 
   * @param authToken 
   * @returns 
   */
  addToGame(client: Socket, password: string, authToken: string) : string {
    if (password in this.games) {
      if (this.games[password].clients.length === 2) {
        this.logger.log('The client tried to enter a full game: ' + client.id);
        
        return "MAX_PLAYERS";
      } else {
        this.logger.log('Client connected to the game: ' + client.id);
        this.games[password].clients.push(
          { 
            client: client,
            userData: this.jwtService.decode(authToken),
            authToken: authToken,
            playground: {
              status: EnumPlaygroundStatus.EDITABLE,
              ships: []
            }
          }
        )
      }
      
      return "CONNECTION_TO_GAME";
    } else {

      this.games[password] = {
        clients: [
          {
            client: client,
            userData: this.jwtService.decode(authToken),
            authToken: authToken,
            playground: {
              status: EnumPlaygroundStatus.EDITABLE,
              ships: []
            }
          }
        ],
        status: 0,
        turn: 0,
        step: 0
      }

      return "GAME_CREATED";

      // this.logger.log('The client tried to enter an already finished game: ' + client.id);
      
      // return "GAME_ENDED";
    }
  }
  /**
   * 
   * @param client 
   * @param password 
   * @param ship 
   * @returns 
   */
  addShip(client: Socket, password: string, ship: Ship) : 0 | 1 {
    const game = this.games[password];
    const clientInx = client === game.clients[0].client ? 0 : 1;

    game.clients[clientInx].playground.ships.forEach(el => {
      if (ship.x + 5 === el.x) {
        return 0;
      }
      
      if (ship.x - 5 === el.x) {
        return 0;
      }

      if(ship.y + 5 === el.y) {
        return 0;
      }

      if(ship.y - 5 === el.y) {
        return 0;
      }
    })

    game.clients[clientInx].playground.ships.push(ship);

    return 1;
  }
  /**
   * 
   * @param client 
   * @param password 
   */
  completePlayground(client: Socket, password: string) {
    const game = this.games[password];
    const clientInx = client === game.clients[0].client ? 0 : 1;
    game.clients[clientInx].playground.status = 1;
  }
  /**
   * 
   * @param password 
   * @returns 
   */
  checkPlaygrounds(password: string) : EnumPlaygroundEditStatus {
    const game = this.games[password];
    const playerOneStatus = game.clients[0]?.playground.status;
    const playerTwoStatus = game.clients[1]?.playground.status;

    if (playerOneStatus !== undefined) {
      if (playerTwoStatus !== undefined) {
        if (playerOneStatus === 1 && playerTwoStatus === 1) {
          return EnumPlaygroundEditStatus.ALL_READY;
        }

        if (playerOneStatus === 1 && playerTwoStatus === 0) {
          return EnumPlaygroundEditStatus.ONLY_SECOND_NOT_READY; 
        }

        if (playerOneStatus === 0 && playerTwoStatus === 1) {
          return EnumPlaygroundEditStatus.ONLY_FIRST_NOT_READY;
        }
      } else {
        return EnumPlaygroundEditStatus.SECOND_NOT_CONNECTED;
      }
    } else {
      return EnumPlaygroundEditStatus.ERROR_WITH_FIRST;
    }
  }
  /**
   * 
   * @param client 
   * @param password 
   * @param shot 
   */
  shotShip(client: Socket, password: string, shot: Shot) {
    const game = this.games[password];
    const clientInx = client === game.clients[0].client ? 1 : 0;

    game.clients[clientInx].playground.ships.forEach(sh => {
      if (sh.x === shot.x && sh.y === shot.y) {
        sh.health -= 1;
        sh.status = EnumShipStatus.DESTROYED;
        
        return { 
          status: "HIT_DESTROY",
          playerShot: clientInx === 0 ? game.clients[0] : game.clients[1],
          playerPlayground: clientInx === 0 ? game.clients[1] : game.clients[0],
          point: shot
        };
      }
    })

    return { 
      status: "PAST",
      playerShot: clientInx === 0 ? game.clients[0] : game.clients[1],
      playerPlayground: clientInx === 0 ? game.clients[1] : game.clients[0],
      point: shot
    };
  }
}
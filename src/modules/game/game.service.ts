import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';
import { Game } from 'src/entities/game.entity';
import { GlobalChatProvider, GlobalGameProvider } from './game.global';
import { randomId } from 'src/utils/randomId.utils';
import { AuthService } from 'src/modules/auth/auth.service';
import { User } from 'src/entities/users.entity';
import { HttpException } from '@nestjs/common/exceptions';
import { HttpStatus } from '@nestjs/common/enums';

import {
  EnumPlayerStatus,
  EnumShipStatus,
  EnumGameStatus
} from 'src/enum/game.enum';

import {
  UserData,
  Point,
  Ship,
  Message
} from 'src/types/game.types';
import { ChatGetMessagesDto, ChatNewMessageDto } from 'src/dto/game.dto';

@Injectable()
export class GameService {

  constructor(
    private readonly userService: UsersService,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    private readonly gameProvider: GlobalGameProvider,
    private readonly chatProvider: GlobalChatProvider,
  ) {}
  /**
   * 
   * @returns 
   */
  async getAll() {
    const data = [];

    Object.keys(this.gameProvider.data).forEach(gameId => {
      if (this.gameProvider.data[gameId].info.status !== EnumGameStatus.Finish) {
        data.push({
          id: gameId,
          name: this.gameProvider.data[gameId].info.name,
          privacy: this.gameProvider.data[gameId].info.privacy.type,
          password: this.gameProvider.data[gameId].info.privacy.password,
          status: this.gameProvider.data[gameId].info.status
        })
      }
    })

    return {
      games: data
    };
  }
  /**
   * 
   * @param player 
   * @param name 
   * @param privacy 
   * @param password 
   * @returns 
   */
  async create(name: string, privacy: boolean, password?: string) {
    const gameId: string = randomId();

    this.gameProvider.data[gameId] = {
      players: {},
      info: {
        status: EnumGameStatus.Waiting,
        name: name,
        privacy: {
          type: privacy,
          password: password
        },
        turn: 0,
        step: 0
      }
    }

    this.chatProvider.data[gameId] = [];

    return { gameId: gameId }
  }
  /**
   * 
   * @param user 
   * @param gameId 
   * @param password 
   * @returns 
   */
  async connect(user: User, gameId: string, password?: string) {
    const game = this.gameProvider.data[gameId];

    if (user.id in game.players) {
      return { msg: true };
    }

    if (password && game.info.privacy.password !== password) {
      throw new HttpException('Wrong password!', HttpStatus.FORBIDDEN);
    }

    if (game.info.status !== EnumGameStatus.Waiting) {
      throw new HttpException('Game in processing!', HttpStatus.FORBIDDEN);
    }

    if (Object.keys(game.players).length === 2) {
      throw new HttpException('Maximum number of players reached!', HttpStatus.FORBIDDEN);
    }

    this.gameProvider.data[gameId].players[user.id] = {
      userData: user,
      point: 0,
      status: EnumPlayerStatus.NotConnect,
      playground: {
        ship: [],
        missed: [],
        destroyed: []
      }
    }

    if (Object.keys(game.players).length === 2) {
      this.gameProvider.data[gameId].info.status = EnumGameStatus.Preparation;
    }
    
    return { msg: true };
  }
  /**
   * 
   * @param gameId 
   * @returns 
   */
  async checkGame(gameId: string) {
    const games = this.gameProvider.data;

    if (games[gameId]) {
      return true;
    } else {
      throw new HttpException('Game does not exists!', HttpStatus.NOT_FOUND);
    }
  }
  /**
   * 
   * @param gameId 
   * @param playerId 
   * @param location 
   * @returns 
   */
  async checkShot(gameId: string, playerId: number, location: Point) {
    const game = this.gameProvider.data[gameId];
    const playersIds = Object.keys(game.players);
    const opponentId = Number(String(playerId) === playersIds[0] ? playersIds[1] : playersIds[0]);
    const ships = game.players[opponentId].playground.ship;

    if (playersIds[game.info.turn] !== String(playerId)) {
      throw new HttpException('Opponent\'s turn', HttpStatus.FORBIDDEN);
    } else {
      this.gameProvider.data[gameId].info.turn = game.info.turn === 0 ? 1 : 0;
      this.gameProvider.data[gameId].info.step += 1;
    }

    for (let s = 0; s < ships.length; s++) {
      const locations = ships[s].locations;
      
      for (let l = 0; l < locations.length; l++) {
        if (
          locations[l].x === location.x &&
          locations[l].y === location.y
        ) {
          this.gameProvider
            .data[gameId]
            .players[opponentId]
            .playground.ship[s].locations.splice(l, 1);

          if (locations.length > 0) {
            this.gameProvider
              .data[gameId]
              .players[playerId].point += 1;
            this.gameProvider
              .data[gameId]
              .players[opponentId]
              .playground.ship[s].status = EnumShipStatus.Damaged;
            this.gameProvider
              .data[gameId]
              .players[opponentId]
              .playground.destroyed.push(location);

            return { 'msg': 'Ship damaged!' };
          } else {
            this.gameProvider
              .data[gameId]
              .players[playerId].point += 1;
            this.gameProvider
              .data[gameId]
              .players[opponentId]
              .playground.ship[s].status = EnumShipStatus.Destroyed;
            this.gameProvider
              .data[gameId]
              .players[opponentId]
              .playground.destroyed.push(location);
            this.gameProvider
              .data[gameId]
              .players[opponentId]
              .playground.ship.splice(s, 1);
            
            return { 'msg': 'Ship destroyed!' };
          }
        }
      }
    }

    this.gameProvider
      .data[gameId]
      .players[opponentId].playground.missed.push(location);

    return { 'msg': 'Shot past' }
  }
  /**
   * 
   * @param socket 
   * @param gameId 
   * @param player 
   */
  async connectSocket(socket: Socket, gameId: string, player: UserData) {
    if (gameId in this.gameProvider.data) {
      const game = this.gameProvider.data[gameId];

      if (String(player.id) in game.players) {
        this.gameProvider.data[gameId].players[String(player.id)].status = EnumGameStatus.Preparation;
      }

      return true;

    } else {
      return false;
    }
  }
  /**
   * 
   * @param gameId 
   * @param player 
   * @returns 
   */
  updatePlayerStatusPreparation(gameId: string, playerId: number) {
    const game = this.gameProvider.data[gameId];
    
    if (game.players[playerId].status === EnumPlayerStatus.NotConnect) {
      game.players[playerId].status = EnumPlayerStatus.Preparation;
      return { msg: 'Status changed to preparion!'};
    }
  }
  /** 
   * 
   * @param gameId 
   * @param playerId 
   * @returns 
   */
  updatePlayerStatusReady(gameId: string, playerId: number) {
    const game = this.gameProvider.data[gameId];
    
    if (game.players[playerId].status === EnumPlayerStatus.Preparation) {
      game.players[playerId].status = EnumPlayerStatus.Ready;
      return { msg: 'Status changed to in game!'};
    }
  }
  /**
   * 
   * @param gameId 
   */
  updateGame(gameId: string) {
    const game = this.gameProvider.data[gameId];

    if (Object.keys(game.players).length === 2) {
      const firstPlayer = Number(Object.keys(game.players)[0]);
      const secondPlayer = Number(Object.keys(game.players)[1]);

      if (
        this.gameProvider.data[gameId].players[firstPlayer].status === EnumPlayerStatus.Preparation &&
        this.gameProvider.data[gameId].players[secondPlayer].status === EnumPlayerStatus.Preparation
      ) {
        this.gameProvider.data[gameId].info.status = EnumGameStatus.Preparation;
      }

      if (
        this.gameProvider.data[gameId].players[firstPlayer].status === EnumPlayerStatus.Ready &&
        this.gameProvider.data[gameId].players[secondPlayer].status === EnumPlayerStatus.Ready
      ) {
        this.gameProvider.data[gameId].info.status = EnumGameStatus.InGame;
        this.gameProvider.data[gameId].players[firstPlayer].status = EnumPlayerStatus.InGame;
        this.gameProvider.data[gameId].players[secondPlayer].status = EnumPlayerStatus.InGame;
      }
      
      if (game.info.status === EnumGameStatus.InGame) {
        if (game.players[firstPlayer].playground.ship.length === 0) {
          this.gameProvider.data[gameId].info.status = EnumGameStatus.Finish;
          this.gameProvider.data[gameId].info.winner = secondPlayer;
          this.gameProvider.data[gameId].players[firstPlayer].status = EnumPlayerStatus.Finish;
          this.gameProvider.data[gameId].players[secondPlayer].status = EnumPlayerStatus.Finish;
        }

        if (game.players[secondPlayer].playground.ship.length === 0) {
          this.gameProvider.data[gameId].info.status = EnumGameStatus.Finish;
          this.gameProvider.data[gameId].info.winner = firstPlayer;
          this.gameProvider.data[gameId].players[firstPlayer].status = EnumPlayerStatus.Finish;
          this.gameProvider.data[gameId].players[secondPlayer].status = EnumPlayerStatus.Finish;
        }
      }
    } else {
      this.gameProvider.data[gameId].info.status = EnumGameStatus.Waiting;
    }
  }
  /**
   * 
   * @param gameId 
   * @param player 
   * @returns 
   */
  getGameInfo(gameId: string) {
    this.updateGame(gameId);
    const game = this.gameProvider.data[gameId];
    return game;
  }
  /**
   * 
   * @param gameId 
   * @param player 
   * @returns 
   */
  getOpponentStatus(gameId: string, player: UserData) {
    const game = this.gameProvider.data[gameId];
    
    if (Object.keys(game.players).length === 2) {
      Object.keys(game.players).forEach(id => {
        if (id !== String(player.id)) {
          return { status: game.players[id].status, data: game.players[id] };
        }
      })
    } else {
      return { status: EnumPlayerStatus.NotConnect };
    }
  }
  /**
   * 
   * @param gameId 
   * @param player 
   * @param ship 
   */
  uploadShips(gameId: string, player: UserData, ships: Ship[]) {
    const game = this.gameProvider.data[gameId];
    ships.forEach(ship => {
      game.players[player.id].playground.ship.push(ship);
    })

    return { msg: 'True' }
  }
  /**
   * 
   * @param gameId 
   * @returns 
   */
  async sendMessage(user: User, { gameId, message }: ChatNewMessageDto) {
    const data : Message = {
      username: user.username,
      message: message
    }
    this.chatProvider.data[gameId].push(data);

    return { msg: 'Message send!' };
  }
  /**
   * 
   * @param gameId
   * @returns 
   */
  loadMessages(gameId: string) {
    const chat = this.chatProvider.data[gameId];
    return chat;
  }
}
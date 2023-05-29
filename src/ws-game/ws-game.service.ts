import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { Game } from 'src/entities/game.entity';
import { GlobalChatProvider, GlobalGameProvider } from './ws-game.global';
import { UsersService } from 'src/users/users.service';
import {
  EnumGameStatus, EnumOpponentStatus, EnumPlayerTurnStatus
} from './enum'
import {
  Message,
  Player,
  PlayerData,
  Password,
  GameAuth,
  GameConnection,
  GameAuthAndPoint,
  Playground,
  Token
} from './types'
import { User } from 'src/entities/users.entity';

@Injectable()
export class WsGameService {
  private logger: Logger = new Logger('WsGameService');

  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    private gameProvider: GlobalGameProvider,
    private chatProvider: GlobalChatProvider,
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}
  /**
   * Checking if the game exists
   * @param password 
   * @returns 
   */
  gameCheckExist(password: Password) {
    if (password in this.gameProvider.data) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * Creating a game
   * @param data 
   */
  gameCreate(password: Password) {
    if (password in this.gameProvider.data) {
      return false;
    } else {
      this.chatProvider.data[password] = [];
      this.gameProvider.data[password] = {
        players: {},
        status: EnumGameStatus.PREPARE,
        turn: 0,
        step: 0,
        saved: false,
        createdAt: new Date(),
      };
      return true;
    }
  }
  /**
   * User logout
   * @param data 
   */
  async gamePlayerLeave(socket: Socket) {
    const data = {
      password: '',
      token: ''
    };

    Object.keys(this.gameProvider.data).forEach(pass => {
      Object.keys(this.gameProvider.data[pass].players).forEach(token => {
        if (socket === this.gameProvider.data[pass].players[token].socket) {
          data.password = pass;
          data.token = token;
        }
      })
    })

    delete this.gameProvider.data[data.password].players[data.token];

    if (Object.keys(this.gameProvider.data[data.password].players).length === 0) {
      delete this.gameProvider.data[data.password];
    }
  }
  /**
   * User connections to the game
   * @param client 
   * @param password 
   * @param authToken 
   * @returns 
   */
  async gameConnect(data: GameConnection) {
    if (data.password in this.gameProvider.data) {
      const game = this.gameProvider.data[data.password];

      if (game.status === 2) return false;

      if (Object.keys(game.players).length === 2) return false;
  
      if (!game.players[data.token]) {

        const user = await this.usersService.findOne(
          this.jwtService.decode(data.token)['login']
        )
        const userData : PlayerData = {
          id: user.id,
          login: user.login,
          username: user.username
        };
        const plaground : Playground = {
          status: 0,
          ships: [],
          missed: []
        };
        const player : Player = {
          socket: data.socket,
          userData: userData,
          token: data.token,
          points: 0,
          playground: plaground
        };

        game.players[data.token] = player;
      } else {
        game.players[data.token].socket = data.socket;
      }

      return true;

    } else {

      return false;
    }
  }
  /**
   * Getting User Points
   * @param data 
   * @returns 
   */
  gameGetPlayersPoints(data: GameAuth) {
    if (data.password in this.gameProvider.data) {
      const game = this.gameProvider.data[data.password];

      if (game.status === EnumGameStatus.PREPARE) return;

      if (Object.keys(game.players).length !== 2) return;
    
      const currentPlayer = game.players[data.token];
      const secondPlayer = game.players[
        Object.keys(game.players)[0] !== data.token
        ? Object.keys(game.players)[0]
        : Object.keys(game.players)[1]
      ];
    
      return {
        player: currentPlayer.points,
        opponent: secondPlayer.points
      }
    } else {
      return false;
    }
  }
  /**
   * Getting the location of ship points, missed shots, and allowed user ships
   * @param password 
   * @param token 
   * @returns 
   */
  gameGetShipsPoints(data: GameAuth) {
    if (data.password in this.gameProvider.data) {
      const game = this.gameProvider.data[data.password];

      if (game.status === EnumGameStatus.PREPARE) return;

      if (Object.keys(game.players).length !== 2) return;

      const currentPlayer = game.players[data.token];
      const secondPlayer = game.players[
        Object.keys(game.players)[0] !== data.token
        ? Object.keys(game.players)[0]
        : Object.keys(game.players)[1]
      ]

      return {
        player: {
          shipsList: currentPlayer.playground.ships.filter(ship => ship.status !== 0),
          missedList: currentPlayer.playground.missed,
          destroyedList: currentPlayer.playground.ships.filter(ship => ship.status === 0)
        },
        opponent: {
          shipList: secondPlayer.playground.ships.filter(ship => ship.status !== 0),
          missedList: secondPlayer.playground.missed,
          destroyedList: secondPlayer.playground.ships.filter(ship => ship.status === 0)
        }
      }
    } else {
      return false;
    }
  }
  /**
   * Getting a turn in a game
   * @param password 
   * @returns 
   */
  gameGetTurn(data: GameAuth) {
    if (data.password in this.gameProvider.data) {
      const game = this.gameProvider.data[data.password];

      if (game.status === EnumGameStatus.PREPARE) return;

      if (Object.keys(game.players).length !== 2) return;

      const clientsList = Object.keys(game.players);

      if (clientsList[game.turn] === data.token) {
        return EnumPlayerTurnStatus.PlayerTurn;
      } else {
        return EnumPlayerTurnStatus.OpponentTurn;
      }
    } else {
      return false;
    }
  }
  /**
   * Getting game status
   * @param password 
   * @returns 
   */
  gameGetStatus(password: Password) : {
    status: number | false,
    step?: number,
    turn?: number,
    winner?: string
  } {
    if (password in this.gameProvider.data) {
      const game = this.gameProvider.data[password];

      if (Object.keys(game.players).length !== 2) {
        return { status: EnumGameStatus.ERROR };
      }
    
      if (game.status === 0) {
        return { status: EnumGameStatus.PREPARE };
      }

      if (game.status === 1) {
        return { status: EnumGameStatus.PROCESSING, turn: game.turn, step: game.step };
      }

      if (game.status === 2) {
        const firstPlayerToken = Object.keys(game.players)[0];
        const secondPlayerToken = Object.keys(game.players)[1];
        
        if (game.saved === false) {
          game.saved = true;
          const gameSave : Game = new Game();

          gameSave.password = password;
          gameSave.firstPlayer = game.players[firstPlayerToken].userData.id;
          gameSave.firstPlayerPoints = game.players[firstPlayerToken].points;
          gameSave.secondPlayer = game.players[secondPlayerToken].userData.id;
          gameSave.secondPlayerPoints = game.players[secondPlayerToken].points
          gameSave.createdAt = game.createdAt;
          gameSave.finishAt = new Date();
          gameSave.steps = game.step;

          if (game.players[firstPlayerToken].points > game.players[secondPlayerToken].points) {
            gameSave.winner = 0;
          } else {
            gameSave.winner = 1;
          }

          this.gameRepository.save(gameSave);
        }

        const winner = game.players[firstPlayerToken].points > game.players[secondPlayerToken].points
            ? game.players[firstPlayerToken].userData.username
            : game.players[secondPlayerToken].userData.username;

        return { 
          status: EnumGameStatus.FINISHED,
          step: game.step,
          winner: winner,
        };
      }

      return { status: EnumGameStatus.ERROR };
    } else {
      return { status: false };
    }
  }
  /**
   * Obtaining Opponent Status
   * @param password 
   * @param token 
   * @returns 
   */
  getOpponentStatus(data: GameAuth) {
    if (data.password in this.gameProvider.data) {
      const game = this.gameProvider.data[data.password];

      if (game.status === EnumGameStatus.PREPARE) return;

      if (Object.keys(game.players).length !== 2) return;

      for (const key in game.players) {
        if (key === data.token) continue;

        if (game.status === EnumGameStatus.PROCESSING) {
          return {
            status: EnumOpponentStatus.IN_GAME,
            username: game.players[key].userData.username
          }
        }

        if (game.players[key].playground.status === 0) {
          return {
            status: EnumOpponentStatus.PREPARATION,
            username: game.players[key].userData.username
          };
        }

        if (game.players[key].playground.status === 1) {
          return {
            status: EnumOpponentStatus.PREPARED,
            username: game.players[key].userData.username
          };
        }
      }

      return { status: EnumOpponentStatus.NOT_CONNECTED, username: "None" };
    } else {
      return false;
    }
  }
  /**
   * Adding a ship to the game
   * @param password 
   * @param token 
   * @param ship 
   * @returns 
   */
  addPlayerShip(data: GameAuthAndPoint) {
    if (data.password in this.gameProvider.data) {
      const game = this.gameProvider.data[data.password];
      const MAX_SHIPS = 5;

      if (game.status !== EnumGameStatus.PREPARE) return false;

      if (game.players[data.token].playground.ships.length <= MAX_SHIPS) {
        game.players[data.token].playground.ships.push({
          status: 1, x: data.point.x, y: data.point.y
        });
      }

      return true;
    } else {
      return false;
    }
  }
  /**
   * Setting player status
   * @param password 
   * @param token 
   * @param status 
   */
  setPlayerReady(data: GameAuth) {
    if (data.password in this.gameProvider.data) {
      const game = this.gameProvider.data[data.password];

      if (game.status !== EnumGameStatus.PREPARE) return;
      
      game.players[data.token].playground.status = 1;

      let preparation = 0;
      let prepared = 0;

      for (const authToken in game.players) {
        if (game.players[authToken].playground.status === 0) {
          preparation += 1;
        }

        if (game.players[authToken].playground.status === 1) {
          prepared += 1;
        }
      }

      if (preparation == 2) {
        game.status = 0;
      } else {
        if (prepared == 2) {
          game.status = 1;
        }
      }
    } else {
      return false;
    }
  }
  /**
   * Handler for a player's shot on the opponent's field
   * @param password 
   * @param token 
   * @param point 
   * @returns 
   */
  playerShot(data: GameAuthAndPoint) {
    if (data.password in this.gameProvider.data) {
      const game = this.gameProvider.data[data.password];
      const clients = game.players;

      if (data.token !== clients[Object.keys(clients)[game.turn]].token) return;

      const firstTurnPlayer = clients[Object.keys(clients)[game.turn]];
      const secondTurnPlayer = clients[
        game.turn === 0
        ? Object.keys(clients)[1]
        : Object.keys(clients)[0]
      ];

      game.turn = game.turn === 0 ? 1 : 0;
      game.step += 1;

      for (let i = 0; i < secondTurnPlayer.playground.ships.length; i++) {
        const ship = secondTurnPlayer.playground.ships[i];

        if (ship.x === data.point.x && ship.y === data.point.y) {
          if (ship.status === 1) {
            firstTurnPlayer.points += 1;
            secondTurnPlayer.playground.ships[i].status = 0;
          }

          if (secondTurnPlayer.playground.ships.filter(sh => sh.status === 1).length === 0) {
            game.status = 2;
          }
        }
      }

      secondTurnPlayer.playground.missed.push(
        {
          x: data.point.x,
          y: data.point.y
        }
      );
    } else {
      return false;
    }
  }
  /**
   * Saving a message
   * @param data 
   */
  saveMessage(data: { password: string, message: Message}) {
    const chat = this.chatProvider.data[data.password];
    chat.push(data.message);
  }
  /**
   * Receiving messages
   * @param password 
   * @returns 
   */
  getMessages(password: string) {
    const chat = this.chatProvider.data[password];
    return chat;
  }
  /**
   * Getting a player's game history
   * @param gameId 
   */
  async loadPlayerHistory(gameId: number) {
    const game = await this.gameRepository.findOne({ where: { id: gameId }});
    const winnerId = game.winner === 0 ? game.firstPlayer : game.secondPlayer;
    const loseId = game.winner === 0 ? game.secondPlayer : game.firstPlayer;
    const winnerPlayer: User = await this.usersService.findOne(winnerId);
    const loserPlayer: User = await this.usersService.findOne(loseId);

    return {
      winnerPlayer: winnerPlayer.username,
      loserPlayer: loserPlayer.username,
      winnerPoints: game.winner === 0 ? game.firstPlayerPoints : game.secondPlayerPoints,
      loserPoints: game.winner === 0 ? game.secondPlayerPoints : game.firstPlayerPoints,
      steps: game.steps,
      createdAt: game.createdAt,
      finishedAt: game.finishAt,
    }
  }
  /**
   * Get player statistics
   * @param token 
   */
  async loadPlayerStatistic(token: Token) {
    const data = {
      playerStatistic: {
        total: 0,
        points: 0,
        win: 0,
        lose: 0
      },
      history: []
    }

    const user = await this.usersService.findOne(
      this.jwtService.decode(token)['login']
    );

    const games = await this.gameRepository
      .createQueryBuilder('game')
      .where('game.firstPlayer = :playerId OR game.secondPlayer = :playerId', { playerId: user.id })
      .getMany();

    for (let i = 0; i < games.length; i++) {
      data.playerStatistic.total += 1;
      data.history.push(
        await this.loadPlayerHistory(games[i].id)
      )
      
      if (games[i].winner === 0) {
        if (games[i].firstPlayer === user.id) {
          data.playerStatistic.win += 1;
          data.playerStatistic.points += games[i].firstPlayerPoints;
        } else {
          data.playerStatistic.lose += 1;
          data.playerStatistic.points += games[i].secondPlayerPoints;
        }
      } else {
        if (games[i].secondPlayer === user.id) {
          data.playerStatistic.win += 1;
          data.playerStatistic.points += games[i].firstPlayerPoints;
        } else {
          data.playerStatistic.lose += 1;
          data.playerStatistic.points += games[i].secondPlayerPoints;;
        }
      }
    }
    
    return data;
  }
}
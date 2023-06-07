import { Socket } from 'socket.io';
import {
  EnumShipStatus,
  EnumPlayerStatus,
  EnumGameStatus
} from '../enum/game.enum'

export type GameID = string;

export type Message = {
  username: string,
  message: string
}

export type ChatRecord = Record<GameID, Message[]>;

export type Point = { 
  x: number,
  y: number
};

export type Ship = {
  locations: Point[],
  status: EnumShipStatus
};

export type UserData = {
  id: number,
  username: string,
  login: string,
}

export type PlayerPlayground = {
  ship: Ship[],
  missed: Point[],
  destroyed: Point[]
}

export type GamePlayer = {
  userData: UserData,
  point: number,
  status: EnumPlayerStatus,
  playground: PlayerPlayground
}

export type GameData = {
  players?: Record<number, GamePlayer>,
  info: {
    status: EnumGameStatus,
    name: string,
    privacy: {
      type: boolean,
      password?: string
    },
    turn: 0 | 1,
    step: number,
    winner?: number,
    saved: boolean,
    createdAt: Date
  }
}

export type GameRecord = Record<GameID, GameData>;
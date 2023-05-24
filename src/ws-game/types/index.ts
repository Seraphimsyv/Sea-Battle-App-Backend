import { Socket } from 'socket.io';
import {
  EnumGameStatus,
  EnumShipStatus,
  EnumPlayerPlaygroundStatus,
  EnumPlayerTurnStatus
} from '../enum'

export type Message = {
  username: string,
  message: string
}

export type Point = { 
  x: number,
  y: number
};

export type Ship = Point & { 
  status: EnumShipStatus
};

export type Playground = {
  status: EnumPlayerPlaygroundStatus,
  ships: Ship[],
  missed: Point[]
}

export type PlayerData = {
  id: number,
  username: string,
  login: string
}

export type Player = {
  socket: Socket,
  userData: PlayerData,
  token: Token,
  points: number,
  playground: Playground
}

export type GameData = {
  players: Record<string, Player>,
  status: EnumGameStatus,
  turn: 0 | 1,
  step: number,
  saved: boolean,
  createdAt: Date,
  messages: Message[]
}

export type GameRecord = Record<Password, GameData>;

export type Token = string;

export type Password = string;

export type GameAuth = {
  token: Token,
  password: Password
}

export type GameConnection = GameAuth & {
  socket: Socket
}

export type GameAuthAndPoint = GameAuth & {
  point: Point
}
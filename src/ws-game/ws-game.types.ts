import { Socket } from "socket.io-client";
import { 
  EnumPlaygroundStatus,
  EnumGameStatus,
  EnumShipStatus,
} from "./ws-game.enum";

type Shot = {
  x: number,
  y: number
}

type Ship = { 
  status: EnumShipStatus, 
  health: 0 | 1,
  x: number,
  y: number
};

type Playground = {
  status: EnumPlaygroundStatus;
  ships?: Ship[]
}

type Player = {
  client: Socket,
  userData: Object,
  authToken: string,
  points?: number,
  playground?: Playground
}

type GameData = {
  clients: [Player?, Player?],
  status: EnumGameStatus,
  turn: 0 | 1,
  step: number,
  winner?: Player
}

type GamesRecord = Record<string, GameData>;

export type {
  Shot,
  Ship,
  Playground,
  Player,
  GameData,
  GamesRecord
}
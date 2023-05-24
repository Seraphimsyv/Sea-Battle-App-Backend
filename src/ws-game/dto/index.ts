import {
  Point
} from '../types';

export type GameAuthDtoData = {
  token: string,
  password: string
};

export type GameShipDtoData = GameAuthDtoData & {
  point: Point
};

export type WebSocketConnectionDto = GameAuthDtoData;
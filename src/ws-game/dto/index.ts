import { IsString, IsNotEmpty, IsObject } from 'class-validator';
import {
  Point
} from '../types';

export class GameAuthDtoData {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  password: string;
};

export class GameShipDtoData extends GameAuthDtoData {
  @IsObject()
  @IsNotEmpty()
  point: Point;
};
import { Injectable, Global } from "@nestjs/common";
import {
  Message,
  GameRecord, GameData
} from './types'

@Global()
@Injectable()
export class GlobalChatProvider {
  public data: Record<string, Message[]> = {};
}

@Global()
@Injectable()
export class GlobalGameProvider {
  public data: GameRecord = {};
}
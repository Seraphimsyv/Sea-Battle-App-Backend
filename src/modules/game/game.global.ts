import { Injectable, Global } from "@nestjs/common";
import {
  ChatRecord,
  GameRecord
} from 'src/types/game.types';

@Global()
@Injectable()
export class GlobalChatProvider {
  public data: ChatRecord = {};
}

@Global()
@Injectable()
export class GlobalGameProvider {
  public data: GameRecord = {};
}
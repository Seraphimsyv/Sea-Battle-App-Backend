import { Injectable, Global } from "@nestjs/common";
import {
  GameRecord, GameData
} from './types'

@Global()
@Injectable()
export class GlobalGameProvider {
  public data: GameRecord = {};
  /**
   * 
   * @param key 
   * @param data 
   */
  public setData(key: string, data: GameData) {
    this.data[key] = data;
  }
  /**
   * 
   * @returns 
   */
  public getAllData() {
    return this.data;
  }
  /**
   * 
   * @param key 
   * @returns 
   */
  public getData(key: string) {
    if (key in this.data) {
      return this.data[key];
    } else {
      return null;
    }
  }
  /**
   * 
   * @param key 
   */
  public deleteData(key: string) {
    delete this.data[key];
  }
}
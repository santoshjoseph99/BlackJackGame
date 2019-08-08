import { Card } from 'deckjs';
import { PlayerActionCb } from './callbacks';
import IPlayerInfo from './iplayerinfo';

export default interface IPlayer {
  position:number;
  sittingOut:boolean;
  bet:number;
  insuranceBet:number;
  cb : PlayerActionCb;
  cards:Card[];
  getInfo () : IPlayerInfo;
}
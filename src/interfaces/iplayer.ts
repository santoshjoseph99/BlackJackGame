import { PlayerActionCb } from './callbacks';
import IPlayerInfo from './iplayerinfo';
import { Card } from 'deckjs';

export default interface IPlayer {
  position:number;
  sittingOut:boolean;
  bet:number;
  insuranceBet:number;
  cb : PlayerActionCb;
  cards:Card[];
  getInfo () : IPlayerInfo;
}
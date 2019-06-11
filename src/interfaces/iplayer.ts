import { PlayerActionCb } from './callbacks';
import IPlayerInfo from './iplayerinfo';

export default interface IPlayer {
  position:number;
  sittingOut:boolean;
  bet:number;
  insuranceBet:number;
  cb : PlayerActionCb;
  getInfo () : IPlayerInfo;
}
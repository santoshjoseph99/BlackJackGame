import IPlayerInfo from './iplayerinfo';

export default interface IPlayer {
  position:number;
  getInfo () : IPlayerInfo;
}
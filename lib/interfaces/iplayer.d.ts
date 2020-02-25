import { Card } from 'deckjs';
import { PlayerActionCb } from './callbacks';
import IPlayerInfo from './iplayerinfo';
export default interface IPlayer {
    position: number;
    money: number;
    name: string;
    sittingOut: boolean;
    bet: number;
    insuranceBet: number;
    cb: PlayerActionCb;
    cards: Card[];
    getInfo(): IPlayerInfo;
}
//# sourceMappingURL=iplayer.d.ts.map
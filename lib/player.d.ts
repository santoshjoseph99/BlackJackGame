import { Card } from "deckjs";
import IPlayerAction from "./interfaces/iplayeraction";
import IPlayerInfo from "./interfaces/iplayerinfo";
import IPlayerResult from "./interfaces/iplayerresult";
import ITableAction from "./interfaces/itableaction";
import { PlayerActionCb } from './interfaces/callbacks';
export default class Player {
    position: number;
    money: number;
    name: string;
    sittingOut: boolean;
    bet: number;
    insuranceBet: number;
    cb: PlayerActionCb | undefined;
    dealerUpCard: Card | undefined;
    burnCard: Card | undefined;
    cards: Card[];
    constructor(name: string, money: number);
    getInfo(): IPlayerInfo;
    tableAction(data: ITableAction): void | Error;
    playerAction(data: IPlayerAction): IPlayerResult | null | Error;
}
//# sourceMappingURL=player.d.ts.map
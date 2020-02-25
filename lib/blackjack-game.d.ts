import { Card } from "deckjs";
import Actions from './actions';
import { PlayerActionCb, TableActionCb } from './interfaces/callbacks';
import { Subscription } from 'rxjs';
import BetsStrategy from './bets-strategy';
import DealerStrategy from './dealer-strategy';
import DoubleDownStrategy from './doubledown-strategy';
import InsuranceStrategy from './insurance-strategy';
import PayoutStrategy from './payout-strategy';
import SixDeckStrategy from './sixdeck-strategy';
import SplitStrategy from './split-strategy';
import TableStrategy from './table-strategy';
import Player from "./player";
interface IAllStrategies {
    insurance: InsuranceStrategy;
    doubleDown: DoubleDownStrategy;
    dealer: DealerStrategy;
    payout: PayoutStrategy;
    deck: SixDeckStrategy;
    bet: BetsStrategy;
    split: SplitStrategy;
    table: TableStrategy;
}
export default class BlackjackGame {
    private players;
    private readyToShuffle;
    private maxPlayers;
    private dealer;
    private tableActions;
    private playerAction;
    private strategies;
    constructor(strategies: IAllStrategies);
    setCards(cards: Card[]): void;
    start(): boolean;
    getValidPlayers(): Player[];
    addPlayer(player: Player, position: number): void | Error;
    subscribeTableActions(cb: TableActionCb): Subscription;
    subscribePlayerActions(player: Player, cb: PlayerActionCb): Subscription | Error;
    getAvailableActions(player: Player): Actions[];
    private dealerUpdate;
    private step1;
    private step2;
    private step3;
    private step4;
    private step5;
    private step6;
    private step7;
    private getCard;
    private dealCardsOnce;
}
export {};
//# sourceMappingURL=blackjack-game.d.ts.map
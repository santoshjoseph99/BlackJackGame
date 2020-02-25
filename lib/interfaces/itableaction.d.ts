import { Card } from "deckjs";
import Actions from "../actions";
import Player from "../player";
export default interface ITableAction {
    action: Actions;
    card?: Card;
    amount?: number;
    player?: Player;
}
//# sourceMappingURL=itableaction.d.ts.map
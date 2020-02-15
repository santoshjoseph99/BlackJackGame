import { Card } from "deckjs";
import Actions from "../actions";
export default interface IDealer {
    cards: Card[];
    action(action: Actions, data: Card): void;
}
//# sourceMappingURL=idealer.d.ts.map
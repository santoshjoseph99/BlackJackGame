"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hand_1 = require("./hand");
class SplitStrategy {
    valid(cards) {
        if (cards.length > 2) {
            return false;
        }
        const [card1, card2] = cards;
        return card1.rank === card2.rank ||
            (hand_1.default.isCardTen(card1) && hand_1.default.isCardTen(card2));
    }
}
exports.default = SplitStrategy;
//# sourceMappingURL=split-strategy.js.map
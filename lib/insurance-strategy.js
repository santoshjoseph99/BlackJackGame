"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deckjs_1 = require("deckjs");
class InsuranceStrategy {
    valid(upCard, downCard) {
        return upCard.rank === deckjs_1.Rank.Ace;
    }
    amount(bet) {
        return Math.ceil(bet / 2);
    }
    payout(bet) {
        return bet * 2;
    }
}
exports.default = InsuranceStrategy;
//# sourceMappingURL=insurance-strategy.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PayoutStrategy {
    getPayout(bet, blackjack) {
        return blackjack ? Math.ceil((bet * 3) / 2) : bet;
    }
}
exports.default = PayoutStrategy;
//# sourceMappingURL=payout-strategy.js.map
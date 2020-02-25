"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DoubleDownStrategy {
    valid(cards) {
        if (cards.length > 2) {
            return false;
        }
        return true;
    }
}
exports.default = DoubleDownStrategy;
//# sourceMappingURL=doubledown-strategy.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actions_1 = require("./actions");
class Dealer {
    constructor() {
        this.cards = [];
    }
    action(action, data) {
        // console.log('--', action, data)
        if (action === actions_1.default.dealerCardDown ||
            action === actions_1.default.dealerCardUp) {
            this.cards.push(data);
        }
        else if (action === actions_1.default.startHand) {
            this.cards = [];
        }
        else {
            throw Error('invalid action');
        }
    }
}
exports.default = Dealer;
//# sourceMappingURL=dealer.js.map
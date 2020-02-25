"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deckjs_1 = require("deckjs");
class SixDeckStrategy {
    constructor() {
        this.numDecks = 6;
        this.deck = new deckjs_1.Deck(this.numDecks, 0);
        this.index = 0;
        this.endIndex = 0;
    }
    setCards(cards) {
        this.deck.setCards(cards);
    }
    getNumOfDecks() {
        return this.numDecks;
    }
    shuffleDeck() {
        this.deck.shuffle();
        this.index = 0;
        this.endIndex = 0;
    }
    setEndIdx(i) {
        this.endIndex = i;
    }
    dealFaceUp() {
        return true;
    }
    getCard() {
        if (this.endIndex === this.index) {
            this.endIndex = 0;
            return undefined;
        }
        this.index++;
        return this.deck.getCard();
    }
}
exports.default = SixDeckStrategy;
//# sourceMappingURL=sixdeck-strategy.js.map
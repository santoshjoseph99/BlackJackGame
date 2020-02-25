"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deckjs_1 = require("deckjs");
const _ = require('lodash');
class Hand {
    static canSplitHand(cards, strategy) {
        return strategy.valid(cards);
    }
    static canDoubleDown(cards, strategy) {
        return strategy.valid(cards);
    }
    static isSoft(cards) {
        if (cards.length === 2 && Hand.hasAce(cards)) {
            return true;
        }
        return false;
    }
    static isHard(cards) {
        if (cards.length === 2 && !Hand.hasAce(cards)) {
            return true;
        }
        return false;
    }
    static hasAce(cards) {
        return cards.some(Hand.isAce);
    }
    static isAce(card) {
        return card.rank === deckjs_1.Rank.Ace;
    }
    static hasBlackjack(values) {
        return values.some(x => x === 21);
    }
    static isCardTen(card) {
        return card.rank === deckjs_1.Rank.Ten ||
            card.rank === deckjs_1.Rank.Jack ||
            card.rank === deckjs_1.Rank.Queen ||
            card.rank === deckjs_1.Rank.King;
    }
    static isNatural(cards) {
        if (cards.length > 2) {
            return false;
        }
        return (cards[0].rank === deckjs_1.Rank.Ace && Hand.isCardTen(cards[1])) ||
            (cards[1].rank === deckjs_1.Rank.Ace && Hand.isCardTen(cards[0]));
    }
    static isHandBusted(values) {
        return values.filter(x => x > 21).length === values.length;
    }
    static getHands(cards) {
        const results = [];
        Hand.getHandsHelper(cards, results);
        if (results.length === 0) {
            results.push(cards);
        }
        return results;
    }
    static getHandsHelper(cards, results) {
        for (let i = 0; i < cards.length; i++) {
            if (Hand.isAce(cards[i])) {
                const cardsLow = _.cloneDeep(cards);
                cardsLow[i].blackjackValue = 1;
                const cardsHigh = _.cloneDeep(cards);
                cardsHigh[i].blackjackValue = 11;
                if (!cardsLow.find(Hand.isAce)) {
                    results.push(cardsLow);
                }
                else {
                    Hand.getHandsHelper(cardsLow, results);
                }
                if (!cardsHigh.find(Hand.isAce)) {
                    results.push(cardsHigh);
                }
                else {
                    Hand.getHandsHelper(cardsHigh, results);
                }
            }
        }
    }
    static getHandValue(cards) {
        return cards.reduce((acc, card) => acc + card.blackjackValue, 0);
    }
    static getHandValues(cards) {
        const handsList = Hand.getHands(cards);
        const handValues = handsList.map(list => Hand.getHandValue(list));
        return _.uniq(handValues).sort();
    }
    getHighestNonBustScore(scores) {
        return _.max(scores.filter(x => x < 22)) || 0;
    }
    getLowestBustScore(scores) {
        return _.min(scores.filter(x => x > 21)) || 0;
    }
}
exports.default = Hand;
//# sourceMappingURL=hand.js.map
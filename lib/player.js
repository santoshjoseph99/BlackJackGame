"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deckjs_1 = require("deckjs");
const actions_1 = require("./actions");
const hand_1 = require("./hand");
class Player {
    constructor(name, money) {
        this.position = -1;
        this.sittingOut = false;
        this.money = money;
        this.name = name;
        this.cards = [];
        this.bet = 0;
        this.insuranceBet = 0;
    }
    getInfo() {
        return {
            bet: this.bet,
            cardHistory: [],
            cards: [],
            money: this.money,
            name: this.name,
            position: this.position,
        };
    }
    tableAction(data) {
        switch (data.action) {
            case actions_1.default.startGame:
            case actions_1.default.shuffle:
            case actions_1.default.setEndCard:
            case actions_1.default.dealerCardDown:
            case actions_1.default.lastHand:
            case actions_1.default.stand:
            case actions_1.default.hit:
            case actions_1.default.bust:
            case actions_1.default.push:
            case actions_1.default.doubleDown:
            case actions_1.default.split:
                break;
            case actions_1.default.burnCardup:
                this.burnCard = data.card;
                break;
            case actions_1.default.exposeDealerCard:
                this.dealerUpCard = data.card;
                break;
            case actions_1.default.playerCardUp:
                break;
            case actions_1.default.playerCardDown:
                break;
            case actions_1.default.endGame:
                break;
            case actions_1.default.startHand:
                break;
            case actions_1.default.endHand:
                break;
            default:
                throw new Error(`Could not handle action, ${data.action.toString()}`);
        }
    }
    playerAction(data) {
        if (!data) {
            throw new Error('Invalid input');
        }
        switch (data.action) {
            case actions_1.default.startHand:
                this.cards = [];
                if (this.money < (data.minBet || 0)) {
                    return null;
                }
                this.money -= data.minBet || 0;
                this.bet = data.minBet || 0;
                return { amount: this.bet };
            case actions_1.default.insurance:
                return null;
            case actions_1.default.playerCardUp:
                this.cards.push(data.card || new deckjs_1.Card(deckjs_1.Rank.Joker, deckjs_1.Suit.Joker));
                break;
            case actions_1.default.collectBet:
                break;
            case actions_1.default.insurancePayout:
                this.money += data.amount || 0;
                break;
            case actions_1.default.push:
                this.money += this.bet;
                break;
            case actions_1.default.playHand:
                if (data && data.availableActions && data.availableActions.length > 0) {
                    const values = hand_1.default.getHandValues(this.cards);
                    if (values.some(x => x >= 17)) {
                        return { action: actions_1.default.stand };
                    }
                    else {
                        return { action: actions_1.default.hit };
                    }
                }
                break;
            case actions_1.default.endHand:
            case actions_1.default.endGame:
                break;
            default:
                throw new Error(`Could not handle action, ${data.action.toString()}`);
        }
        return {};
    }
}
exports.default = Player;
//# sourceMappingURL=player.js.map
const defaults = require('lodash/defaults');
const cloneDeep = require('lodash/cloneDeep');
const uniq = require('lodash/uniq');
const Deck = require('deckjs');
const SixDeckStrategy = require('./sixdeck-strategy');


class DefaultDoubleDownStrategy {
  check(card1, card2){
    return true;
  }
};

class DefaultInsuranceStrategy {
  offerInsurance(upCard, downCard){
    return upCard.rank === 'a';
  }
  insurancePayout(bet){
    return bet * 2;
  }
};

class DefaultDealerStrategy {
  dealCardsUp(){
    return true;
  }
};

class DefaultPayoutStrategy {
  getPayout(bet, blackjack){
    return Math.ceil((bet*3)/2);
  }
};

class DefaultBetsStrategy {
  getMin() {
    return 10;
  }
  getMax() {
    return 100;
  }
}

class BlackjackGame {

  /*
    1. deal:
      a. burn card
      b. deal face up 1 card to every player + dealer face up
      c. deal face up 1 card to every player + dealer face down
    2. play:
      a. if dealers upcards is A or T, then insurance is offered
      b.  if dealer has blackjack then insurance bet are paid out
          and player bets are collected except when player has natural bj too
      c.  if no dealer blackjack, then play proceeds from player 1
      d. dealer plays hand
    3. payouts:
      a. dealer collects or pays out
  */

  constructor(strategies = {}) {
    this.strategies = {};
    this.deck = null;
    this.strategies.insurance = new DefaultInsuranceStrategy();
    this.strategies.doubleDown = new DefaultDoubleDownStrategy();
    this.strategies.dealer = new DefaultDealerStrategy();
    this.strategies.payout = new DefaultPayoutStrategy();
    this.strategies.deck = new DefaultDeckStrategy();
    this.strategies.bet = new DefaultBetsStrategy();
    defaults(strategies, this.strategies);
    this.deck = new Deck(strategies.deck.getNumOfDecks());
  }

  start(callback, players) {
    if(!this.isGamePlayable(players)) {
      callback.endGame();
      return;
    }
    callback.startGame();
    this.deck.shuffleDeck();
    this.burnCard();
    while(true){
      players.forEach(p => callback.startHand(p));
      this.dealCards(players);
      this.checkForInsurance();
      this.checkForNaturals(players);
      players.forEach(p => this.playHand(p, callback));
      this.handlePayOuts();
      players.forEach(p => callback.endHand(p));
      if(!this.isGamePlayable(players, this.deck)) {
        break;
      }
    }
    callback.endGame();
  }

  isGamePlayable(players) {

  }

  burnCard() {

  }

  checkForInsurance() {

  }

  playHand() {

  }

  getCardValue(card) {
    let cardValue = null;
    if(this.isCardTen(card)) {
      cardValue = 10;
    }
    if(!cardValue) {
      cardValue = parseInt(card.rank);
    }
    return cardValue;
  }

  isAce(card) {
    return card.rank === 'a';
  }

  isCardTen(card) {
    return card.rank === 't' ||
           card.rank === 'j' ||
           card.rank === 'q' ||
           card.rank === 'k';
  }

  isNatural(cards) {
    if(cards.length > 2) return false;
    return cards[0].rank === 'a' && this.isCardTen(cards[1]) ||
           cards[1].rank === 'a' && this.isCardTen(cards[0]);
  }

  getHands(cards) {
    let results = [];
    this.getHandsHelper(cards, results);
    if (results.length === 0) results.push(cards);
    return results;
  }

  getHandsHelper(cards, results) {
    for(let i = 0; i < cards.length; i++) {
      if(this.isAce(cards[i])) {
        let cardsLow = cloneDeep(cards);
        cardsLow[i].rank = '1';
        let cardsHigh = cloneDeep(cards);
        cardsHigh[i].rank = '11';
        if(!cardsLow.find(this.isAce)) {
          results.push(cardsLow);
        } else {
          this.getHandsHelper(cardsLow, results);
        }
        if(!cardsHigh.find(this.isAce)){
          results.push(cardsHigh);
        } else {
          this.getHandsHelper(cardsHigh, results);
        }
      }
    }
  }

  getHandValue(cards) {
    return cards.reduce((acc, card) => {return acc + this.getCardValue(card)}, 0);
  }

  getHandValues(cards) {
    let handsList = this.getHands(cards);
    let handValues = handsList.map(list => this.getHandValue(list));
    return uniq(handValues);
  }
}

module.exports = BlackjackGame;
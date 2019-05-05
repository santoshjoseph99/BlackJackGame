const Deck = require('deckjs');

module.exports = class SixDeckStrategy {
  constructor() {
    this.numDecks = 6;
    this.deck = new Deck(this.numDecks);
    this.index = 0;
    this.endIndex = 0;
  }
  getNumOfDecks(){
    return this.numDecks;
  }
  shuffleDeck(){
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
    if(this.endIndex === this.index) {
      this.endIndex = 0;
      return null;
    }
    this.index++;
    return this.deck.getCard();
  }
};
const shuffle = require('lodash/shuffle');

export default class SixDeckStrategy {
  constructor() {
    const ranks = 'a23456789tjqk'.split('');
    const suits = 'cdhs'.split('');
    this.numDecks = 6;
    this.cards = [];
    this.index = 0;
    this.endIndex = 0;
    for(let i = 0; i < this.numDecks; i++) {
      for(let s = 0; s < suits.length; s++) {
        for(let r = 0; r < ranks.length; r++) {
          this.cards.push({rank: ranks[r], suit: suits[s]});
        }
      }
    }
  }
  getNumOfDecks(){
    return this.numDecks;
  }
  shuffleDeck(){
    shuffle(this.cards);
  }
  setEndIdx(i) {
    this.endIndex = i;
  }
  getCard() {
    if(this.endIndex === this.index) {
      return null;
    }
    return this.cards[this.index++];
  }
};
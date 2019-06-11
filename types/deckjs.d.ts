export class Card {
  constructor(rank: any, suite: any);
  rank: any;
  suite: any;
}
export class Deck {
  constructor(numOfDecks: any, jokersPerDeck: any);
  cards: any;
  getCard(): any;
  init(numOfDecks: any, jokersPerDeck: any): void;
  shuffle(): void;
}

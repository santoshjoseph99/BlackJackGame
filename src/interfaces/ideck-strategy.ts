import {Card, Deck} from 'deckjs';

export default interface IDeckStrategy {
  getNumOfDecks () : number;
  shuffleDeck () : void;
  setEndIdx (i:number) : void;
  dealFaceUp () : boolean;
  getCard () : Card|undefined;
  setCards(cards:Card[]): void;
}

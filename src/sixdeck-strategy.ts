import {Card, Deck} from 'deckjs';
import IDeckStrategy from './interfaces/ideck-strategy';

export default class SixDeckStrategy implements IDeckStrategy {
  private numDecks:number;
  private deck:Deck;
  private index:number;
  private endIndex:number;

  constructor () {
    this.numDecks = 6
    this.deck = new Deck(this.numDecks, 0)
    this.index = 0
    this.endIndex = 0
  }
  public setCards(cards:Card[]) : void {
    this.deck.setCards(cards);
  }
  public getNumOfDecks () : number {
    return this.numDecks
  }
  public shuffleDeck () : void {
    this.deck.shuffle()
    this.index = 0
    this.endIndex = 0
  }
  public setEndIdx (i:number) : void {
    this.endIndex = i
  }
  public dealFaceUp () : boolean{
    return true
  }
  public getCard () : Card|undefined {
    if (this.endIndex === this.index) {
      this.endIndex = 0
      return undefined;
    }
    this.index++
    return this.deck.getCard()
  }
}

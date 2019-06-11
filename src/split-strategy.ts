import {Card} from 'deckjs';
import Hand from './hand';
import ISplitStrategy from './interfaces/isplit-strategy';

export default class SplitStrategy implements ISplitStrategy {
  public valid (cards:Card[]) {
    if (cards.length > 2) {
      return false
    }
    const [card1, card2] = cards
    return card1.rank === card2.rank ||
      (Hand.isCardTen(card1) && Hand.isCardTen(card2))
  }
}

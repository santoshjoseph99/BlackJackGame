import {Card} from 'deckjs';
import IDoubleDownStrategy from './interfaces/idoubledown-strategy';

export default class DoubleDownStrategy implements IDoubleDownStrategy {
  public valid (cards:Card[]):boolean {
    if (cards.length > 2) {
      return false
    }
    return true
  }
}

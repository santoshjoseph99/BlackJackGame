import {Card} from 'deckjs';

export default interface IDoubleDownStrategy {
  valid (cards:Card[]): boolean;
}

import {Card} from 'deckjs';

export default interface ISplitStrategy {
  valid (cards:Card[]) : boolean;
}

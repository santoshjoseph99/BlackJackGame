import { Card } from 'deckjs';
import Actions from './actions';
import IDealer from './interfaces/idealer';

export default class Dealer implements IDealer {
  public cards:any[] = [];
  public action (action:Actions, data:Card) {
    // console.log('--', action, data)
    if (action === Actions.dealerCardDown ||
        action === Actions.dealerCardUp) {
      this.cards.push(data)
    } else if (action === Actions.startHand) {
      this.cards = []
    } else {
      throw Error('invalid action');
    }
  }
}

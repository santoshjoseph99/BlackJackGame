import { Card } from 'deckjs';
import Actions from './actions';
import IDealer from './interfaces/idealer';

export default class Dealer implements IDealer {
  public cards:any[] = [];
  public action (action:Actions, data:Card) {
    // console.log('--', action, data)
    if (action === Actions.DEALER_CARD_DOWN ||
        action === Actions.DEALER_CARD_UP) {
      this.cards.push(data)
    } else if (action === Actions.START_HAND) {
      this.cards = []
    } else {
      throw Error('invalid action');
    }
  }
}

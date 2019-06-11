import {Card} from 'deckjs';

export default interface IInsuranceStrategy {
  valid (upCard:Card, downCard:Card) : boolean;
  amount (bet:number):number;
  payout (bet:number):number;
}

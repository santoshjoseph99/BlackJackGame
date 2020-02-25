import {Card, Rank} from 'deckjs';
import IInsuranceStrategy from './interfaces/iinsurance-strategy';

export default class InsuranceStrategy implements IInsuranceStrategy {
  public valid (upCard:Card, downCard:Card):boolean {
    return upCard.rank === Rank.Ace;
  }
  public amount (bet:number) :number{
    return Math.ceil(bet / 2)
  }
  public payout (bet:number):number {
    return bet * 2
  }
}

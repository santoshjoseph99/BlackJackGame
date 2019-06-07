import IPayoutStrategy from './interfaces/ipayout-strategy';

export default class PayoutStrategy implements IPayoutStrategy {
  public getPayout (bet:number, blackjack:boolean):number {
    return blackjack ? Math.ceil((bet * 3) / 2) : bet
  }
}

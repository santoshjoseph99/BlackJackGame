export default interface IPayoutStrategy {
  getPayout (bet:number, blackjack:boolean):number;
}

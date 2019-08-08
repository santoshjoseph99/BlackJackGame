import { Card } from "deckjs";
import Actions from "../actions";

export default interface IPlayerAction {
  action:Actions;
  card?:Card;
  minBet?:number;
  maxBet?:number;
  amount?:number;
  availableActions?:Actions[]
}
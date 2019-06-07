import Actions from "../actions";
import { Card } from "deckjs";

export default interface IPlayerAction {
  action:Actions;
  card:Card;
  minBet:number;
  amount:number;
}
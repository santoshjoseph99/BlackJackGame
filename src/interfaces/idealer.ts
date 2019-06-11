import Actions from "../actions";
import { Card } from "deckjs";

export default interface IDealer {
  cards:Card[];
  action (action:Actions, data:Card):void;
}
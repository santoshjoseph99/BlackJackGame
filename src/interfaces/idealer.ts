import Actions from "../actions";
import { Card } from "deckjs";

export default interface IDealer {
  action (action:Actions, data:Card):void;
}
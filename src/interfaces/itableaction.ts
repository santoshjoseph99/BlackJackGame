import { Card } from "deckjs";
import Actions from "../actions";

export default interface ITableAction {
  action:Actions;
  card:Card;
}
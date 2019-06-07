import Actions from "../actions";
import { Card } from "deckjs";

export default interface ITableAction {
  action:Actions;
  card:Card;
}
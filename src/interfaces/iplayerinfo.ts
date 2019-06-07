import {Card} from 'deckjs';

export default interface IPlayerInfo {
  position: number,
  name: string,
  money: number,
  bet: number,
  cardHistory: Card[],
  cards: string,
}
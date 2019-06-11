import IPlayer from "./interfaces/iplayer";
import { Card } from "deckjs";
import IPlayerInfo from "./interfaces/iplayerinfo";
import ITableAction from "./interfaces/itableaction";
import IPlayerAction from "./interfaces/iplayeraction";
import actions from './actions';
import Hand from './hand';

export default class Player implements IPlayer {
  private pos:number;
  private money:number;
  private name:string;
  private cards:Card[];
  private currentBet:number;
  private burnCard:Card;
  private dealerUpCard:Card;
  private sittingOut:boolean;

  constructor (name:string, money:number) {
    this.pos = -1
    this.money = money
    this.name = name
    this.cards = []
    this.currentBet = 0
  }
  set position (pos) {
    this.pos = pos
  }
  get position () {
    return this.pos
  }
  public getInfo () :IPlayerInfo {
    return {
      bet: this.currentBet,
      cardHistory: [],
      cards: [],
      money: this.money,
      name: this.name,
      position: this.position,
    }
  }
  public tableAction (data:ITableAction) {
    switch (data.action) {
      case actions.START_GAME:
      case actions.SHUFFLE:
      case actions.SET_END_CARD:
      case actions.DEALER_CARD_DOWN:
      case actions.LAST_HAND:
      case actions.STAND:
      case actions.HIT:
      case actions.BUST:
      case actions.PUSH:
      case actions.DOUBLE_DOWN:
      case actions.SPLIT:
        break
      case actions.BURN_CARD_UP:
        this.burnCard = data.card
        break
      case actions.EXPOSE_DEALER_CARD:
        this.dealerUpCard = data.card
        break
      case actions.PLAYER_CARD_UP:
        break
      case actions.END_GAME:
        break
      case actions.START_HAND:
        break
      case actions.END_HAND:
        break
      default:
        throw new Error('Could not handle action', data.action.toString())
    }
  }
  public playerAction (data:IPlayerAction) {
    switch (data.action) {
      case actions.START_HAND:
        this.cards = []
        if (this.money < data.minBet) {
          return null
        }
        this.money -= data.minBet
        this.currentBet = data.minBet
        return this.currentBet
      case actions.INSURANCE:
        return null
      case actions.PLAYER_CARD_UP:
        this.cards.push(data.card)
        break
      case actions.COLLECT_BET:
        break
      case actions.INSURANCE_PAYOUT:
        this.money += data.amount
        break
      case actions.PUSH:
        this.money += this.currentBet
        break
      case actions.PLAY_HAND:
        if (actions.availableActions.length > 0) {
          const values = Hand.getHandValues(this.cards)
          if (values.some(x => x >= 17)) {
            return { action: actions.STAND }
          } else {
            return { action: actions.HIT }
          }
        }
        break
      case actions.END_HAND:
      case actions.END_GAME:
        break
      default:
        throw new Error('Could not handle action', data.action.toString())
    }
  }
}

import { Card, Rank, Suit } from "deckjs";
import actions from './actions';
import Hand from './hand';
import IPlayerAction from "./interfaces/iplayeraction";
import IPlayerInfo from "./interfaces/iplayerinfo";
import IPlayerResult from "./interfaces/iplayerresult";
import ITableAction from "./interfaces/itableaction";
import { PlayerActionCb } from './interfaces/callbacks';

export default class Player {
  position:number;
  money:number;
  name:string;
  sittingOut:boolean;
  bet:number;
  insuranceBet:number;
  cb : PlayerActionCb|undefined;
  dealerUpCard: Card|undefined;
  burnCard: Card|undefined;
  cards:Card[];

  constructor (name:string, money:number) {
    this.position = -1
    this.sittingOut = false;
    this.money = money;
    this.name = name;
    this.cards = [];
    this.bet = 0;
    this.insuranceBet = 0;
  }

  public getInfo () :IPlayerInfo {
    return {
      bet: this.bet,
      cardHistory: [],
      cards: [],
      money: this.money,
      name: this.name,
      position: this.position,
    }
  }

  public tableAction (data:ITableAction):void|Error {
    switch (data.action) {
      case actions.startGame:
      case actions.shuffle:
      case actions.setEndCard:
      case actions.dealerCardDown:
      case actions.lastHand:
      case actions.stand:
      case actions.hit:
      case actions.bust:
      case actions.push:
      case actions.doubleDown:
      case actions.split:
        break
      case actions.burnCardup:
        this.burnCard = data.card
        break
      case actions.exposeDealerCard:
        this.dealerUpCard = data.card
        break
      case actions.playerCardUp:
        break
      case actions.playerCardDown:
        break;
      case actions.endGame:
        break
      case actions.startHand:
        break
      case actions.endHand:
        break
      default:
        throw new Error(`Could not handle action, ${data.action.toString()}`)
    }
  }
  public playerAction (data:IPlayerAction):IPlayerResult|null|Error {
    if(!data) {
      throw new Error('Invalid input')
    }
    switch (data.action) {
      case actions.startHand:
        this.cards = []
        if (this.money < (data.minBet|| 0)) {
          return null
        }
        this.money -= data.minBet || 0
        this.bet = data.minBet || 0
        return {amount:this.bet}
      case actions.insurance:
        return null
      case actions.playerCardUp:
        this.cards.push(data.card || new Card(Rank.Joker, Suit.Joker))
        break
      case actions.collectBet:
        break
      case actions.insurancePayout:
        this.money += data.amount || 0
        break
      case actions.push:
        this.money += this.bet
        break
      case actions.playHand:
        if (data && data.availableActions && data.availableActions.length > 0) {
          const values = Hand.getHandValues(this.cards)
          if (values.some(x => x >= 17)) {
            return { action: actions.stand }
          } else {
            return { action: actions.hit }
          }
        }
        break
      case actions.endHand:
      case actions.endGame:
        break
      default:
        throw new Error(`Could not handle action, ${data.action.toString()}`)
    }
    return {}
  }
}

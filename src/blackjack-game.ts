import { Card, Deck } from "deckjs";
import Actions from './actions';
import { PlayerActionCb, TableActionCb } from './interfaces/callbacks';
import IDealer from "./interfaces/idealer";
import IPlayer from "./interfaces/iplayer";

import defaults from 'lodash/defaults';
import { Subject, Subscription } from 'rxjs'
import actions from './actions'
import BetsStrategy from './bets-strategy'
import Dealer from './dealer'
import DealerStrategy from './dealer-strategy'
import DoubleDownStrategy from './doubledown-strategy'
import Hand from './hand'
import InsuranceStrategy from './insurance-strategy'
import PayoutStrategy from './payout-strategy'
import SixDeckStrategy from './sixdeck-strategy'
import SplitStrategy from './split-strategy'
import TableStrategy from './table-strategy'

interface IAllStrategies {
  insurance: InsuranceStrategy
  doubleDown: DoubleDownStrategy
  dealer: DealerStrategy
  payout:  PayoutStrategy
  deck: SixDeckStrategy
  bet: BetsStrategy
  split: SplitStrategy
  table: TableStrategy
}

interface IPlayers {
  cb: PlayerActionCb;
  player:IPlayer;
  sittingOut:boolean;
}

export default class BlackjackGame {
  private players:IPlayers[];
  private deck:Deck;
  private readyToShuffle:boolean;
  private maxPlayers:number;
  private dealer:IDealer;
  private tableActions:any;
  private playerAction:any;
  private strategies:IAllStrategies

  constructor (strategies = {}) {
    this.strategies.insurance = new InsuranceStrategy()
    this.strategies.doubleDown = new DoubleDownStrategy()
    this.strategies.dealer = new DealerStrategy()
    this.strategies.payout = new PayoutStrategy()
    this.strategies.deck = new SixDeckStrategy()
    this.strategies.bet = new BetsStrategy()
    this.strategies.split = new SplitStrategy()
    this.strategies.table = new TableStrategy()
    this.readyToShuffle = false
    defaults(strategies, this.strategies)
    this.dealer = new Dealer()
    this.tableActions = new Subject()
    this.playerAction = new Subject()
    this.players = []
    this.maxPlayers = this.strategies.table.maxPlayers()
    // this.gameFlow = new BlackjackFlow()
    this.deck = new Deck(this.strategies.deck.getNumOfDecks(), 0);
  }

  public start () : boolean {
    if (this.getValidPlayers().length === 0) {
      return false
    }
    this.step1()
    this.step2()
    while (!this.readyToShuffle) {
      this.step3()
      this.step4()
      this.step5()
      this.step6()
    }
    this.step7()
    return true
  }

  public getValidPlayers () : IPlayers[]{
    return this.players.filter(x => x && !x.sittingOut)
  }

  public addPlayer (player:IPlayer, position:number): void|Error {
    if (position > this.maxPlayers || position < 0) {
      return new Error(`position must be 1 and ${this.maxPlayers}`)
    }
    if (this.players[position]) {
      return new Error('position not available')
    }
    const p = this.players.find(x => player === x.player)
    if (p) {
      return new Error('player already is at the table')
    }
    this.players[position - 1] = { player, sittingOut: false, cb: null }
  }

  public subscribeTableActions (cb:TableActionCb):Subscription {
    return this.tableActions.subscribe(cb)
  }

  public subscribePlayerActions (player:IPlayer, cb:PlayerActionCb) : Subscription|Error {
    const p = this.players.find(x => player === x.player)
    if (!p || !cb || typeof cb !== 'function') {
      return new Error('invalid player or invalid callback')
    }
    p.cb = cb
    return this.playerAction.subscribe(cb)
  }

  public getAvailableActions (player:IPlayer) : Actions[] {
    const results = []
    const { cards, money, bet } = player.getInfo()

    if (this.strategies.split.valid(cards)) {
      if (money >= bet) {
        results.push(actions.SPLIT)
      }
    }
    if (this.strategies.doubleDown.valid(cards)) {
      if (money > 0) {
        results.push(actions.DOUBLE_DOWN)
      }
    }
    const handValues = Hand.getHandValues(cards)
    if (Hand.hasBlackjack(handValues)) {
      return []
    }
    if (!Hand.checkHandBust(handValues)) {
      results.push(actions.HIT)
      results.push(actions.STAND)
    }
    return results;
  }
  // private dealerUpdate(action:Actions){
  // }
  private step1 () {
    this.tableActions.next({ action: Actions.START_GAME })
    this.strategies.deck.shuffleDeck()
    this.tableActions.next({ action: Actions.SHUFFLE })
    this.strategies.deck.setEndIdx(this.strategies.table.getEndDeckIndex())
    this.tableActions.next({ action: Actions.SET_END_CARD })
    this.strategies.deck.setEndIdx(260)
    this.tableActions.next({
      action: Actions.BURN_CARD_UP,
      card: this.strategies.deck.getCard()
    })
  }
  private step2 () {
    this.dealerUpdate(Actions.START_HAND)
    this.getValidPlayers().forEach(p => {
      const bet = p.player.cb({
        action: Actions.START_HAND,
        maxBet: this.strategies.bet.getMax(),
        minBet: this.strategies.bet.getMin(),
      })
      if (!bet) {
        p.sittingOut = true
        return
      }
      this.tableActions.next({ action: Actions.PLAYER_BET_AMOUNT, amount: bet, player: p })
    })
  }
  private step3 () {
    this.dealCardsOnce()
    this.dealCardsOnce()
    this.tableActions.next({
      action: Actions.EXPOSE_DEALER_CARD,
      card: this.dealer.cards[0]
    })
  }
  private step4 () {
    if (this.strategies.insurance.valid(this.dealer.cards[0], this.dealer.cards[1])) {
      this.getValidPlayers().forEach(p => {
        const amount = this.strategies.insurance.amount(p.player.bet)
        const result = p.player.cb({ action: Actions.INSURANCE, amount })
        if (result.amount === amount) {
          p.player.insuranceBet = result.amount
        }
      })
    }
  }
  private step5 () {
    if (Hand.isNatural(this.dealer.cards)) {
      this.getValidPlayers().forEach(p => {
        if (p.player.insuranceBet) {
          this.tableActions({ action: Actions.COLLECT_BET, player: p })
          p.player.cb({ action: Actions.COLLECT_BET })
          this.tableActions({ action: Actions.INSURANCE_PAYOUT, player: p })
          p.player.cb({
            action: Actions.INSURANCE_PAYOUT,
            amount: this.strategies.insurance.payout(p.player.insuranceBet)
          })
        } else if (!Hand.isNatural(p.player.getInfo().cards)) {
          this.tableActions({ action: Actions.COLLECT_BET, player: p })
          p.player.cb({ action: Actions.COLLECT_BET })
        } else {
          this.tableActions({ action: Actions.PUSH, player: p.player })
          p.player.cb({ action: Actions.PUSH })
        }
      })
    } else {
      this.getValidPlayers().forEach(p => {
        while (true) {
          const result = p.player.cb({ action: Actions.PLAY_HAND, availableActions: this.getAvailableActions(p.player) })
          switch (result.action) {
            case Actions.STAND:
              this.tableActions({ action: Actions.STAND, player: p })
              break
            case Actions.HIT:
              this.tableActions({ action: Actions.HIT, player: p })
              const card = this.getCard(p.player)
              p.cb({ action: Actions.PLAYER_CARD_UP, card })
              this.tableActions({ action: Actions.PLAYER_CARD_UP, card, player: p })
              const values1 = Hand.getHandValues(p.player.cards)
              if (this.checkHandBust(values1)) {
                p.player.cb({ action: Actions.BUST })
                this.tableActions({ action: Actions.BUST, player: p })
              }
              break
            case Actions.DOUBLE_DOWN:
              this.tableActions({ action: Actions.DOUBLE_DOWN, player: p })
              p.player.cb({ action: Actions.PLAYER_CARD_UP, card })
              this.tableActions({ action: Actions.PLAYER_CARD_UP, card, player: p })
              const values2 = Hand.getHandValues(p.player.cards)
              if (this.checkHandBust(values2)) {
                p.player.cb({ action: Actions.BUST })
                this.tableActions({ action: Actions.BUST, player: p })
              }
              break
            case Actions.SPLIT:
              // TODO
              // this.tableActions({ action: Actions.SPLIT, player: p });
              break
          }
        }
      })
    }
  }
  private step6 () {
    this.tableActions.next({ action: Actions.END_HAND })
  }
  private step7 () {
    this.tableActions.next({ action: Actions.END_GAME })
  }
  private checkHandBust (values:number[]) {
    return values.filter(x => x <= 21).length === values.length
  }
  private getCard (p:IPlayer):Card {
    let card = this.strategies.deck.getCard()
    if (!card) {
      this.tableActions.next({ action: Actions.LAST_HAND })
      card = this.strategies.deck.getCard()
      this.readyToShuffle = true
    }
    p.cb({ action: Actions.PLAYER_CARD_UP, card })
    this.tableActions.next({ action: Actions.PLAYER_CARD_UP, card, player: p })
    return card;
  }
  private dealCardsOnce () {
    const dealerCard = this.strategies.deck.getCard()
    this.tableActions.next({ action: Actions.DEALER_CARD_DOWN, card: dealerCard })
    this.dealer.action(Actions.DEALER_CARD_DOWN, dealerCard)
    this.getValidPlayers().forEach(p => {
      let card = this.strategies.deck.getCard()
      if (!card) {
        this.tableActions.next({ action: Actions.LAST_HAND })
        card = this.strategies.deck.getCard()
        this.readyToShuffle = true
      }
      p.cb({ action: Actions.PLAYER_CARD_UP, card })
      this.tableActions.next({ action: Actions.PLAYER_CARD_UP, card, player: p })
    })
  }
}

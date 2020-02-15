import { Card, Rank, Suit } from "deckjs";
import Actions from './actions';
import { PlayerActionCb, TableActionCb } from './interfaces/callbacks';
import IDealer from "./interfaces/idealer";
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
import ITableAction from "./interfaces/itableaction";
import IPlayerAction from "./interfaces/iplayeraction";
import Player from "./player";
const defaults = require('lodash/defaults');

interface IAllStrategies {
  insurance: InsuranceStrategy
  doubleDown: DoubleDownStrategy
  dealer: DealerStrategy
  payout: PayoutStrategy
  deck: SixDeckStrategy
  bet: BetsStrategy
  split: SplitStrategy
  table: TableStrategy
}

class AllStrategies implements IAllStrategies {
  insurance: InsuranceStrategy;
  doubleDown: DoubleDownStrategy;
  dealer: DealerStrategy;
  payout: PayoutStrategy;
  deck: SixDeckStrategy;
  bet: BetsStrategy;
  split: SplitStrategy;
  table: TableStrategy;

  constructor() {
    this.insurance = new InsuranceStrategy()
    this.doubleDown = new DoubleDownStrategy()
    this.dealer = new DealerStrategy()
    this.payout = new PayoutStrategy()
    this.deck = new SixDeckStrategy()
    this.bet = new BetsStrategy()
    this.split = new SplitStrategy()
    this.table = new TableStrategy()
  }
}


export default class BlackjackGame {
  private players: Player[];
  private readyToShuffle: boolean;
  private maxPlayers: number;
  private dealer: IDealer;
  private tableActions: Subject<ITableAction>;
  private playerAction: Subject<IPlayerAction>;
  private strategies: IAllStrategies

  constructor(strategies: IAllStrategies) {
    this.strategies = new AllStrategies();
    defaults(strategies, this.strategies)
    this.readyToShuffle = false
    this.dealer = new Dealer()
    this.tableActions = new Subject()
    this.playerAction = new Subject()
    this.players = []
    this.maxPlayers = this.strategies.table.maxPlayers()
  }

  public start(): boolean {
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

  public getValidPlayers(): Player[] {
    return this.players.filter(x => x && !x.sittingOut)
  }

  public addPlayer(player: Player, position: number): void | Error {
    if (position > this.maxPlayers || position < 0) {
      return new Error(`position must be 1 and ${this.maxPlayers}`)
    }
    if (this.players[position]) {
      return new Error('position not available')
    }
    const p = this.players.find(x => player === x)
    if (p) {
      return new Error('player already is at the table')
    }
    player.sittingOut = true;
    this.players[position - 1] = player
  }

  public subscribeTableActions(cb: TableActionCb): Subscription {
    return this.tableActions.subscribe(cb)
  }

  public subscribePlayerActions(player: Player, cb: PlayerActionCb): Subscription | Error {
    const p = this.players.find(x => player === x)
    if (!p || !cb || typeof cb !== 'function') {
      return new Error('invalid player or invalid callback')
    }
    p.cb = cb
    return this.playerAction.subscribe(cb)
  }

  public getAvailableActions(player: Player): Actions[] {
    const results = []
    const { cards, money, bet } = player.getInfo()

    if (this.strategies.split.valid(cards)) {
      if (money >= bet) {
        results.push(actions.split)
      }
    }
    if (this.strategies.doubleDown.valid(cards)) {
      if (money > 0) {
        results.push(actions.doubleDown)
      }
    }
    const handValues = Hand.getHandValues(cards)
    if (Hand.hasBlackjack(handValues)) {
      return []
    }
    if (!Hand.checkHandBust(handValues)) {
      results.push(actions.hit)
      results.push(actions.stand)
    }
    return results;
  }
  private dealerUpdate(action:Actions){
  }
  private step1() {
    this.tableActions.next({ action: Actions.startGame })
    this.strategies.deck.shuffleDeck()
    this.tableActions.next({ action: Actions.shuffle })
    this.strategies.deck.setEndIdx(this.strategies.table.getEndDeckIndex())
    this.tableActions.next({ action: Actions.setEndCard })
    this.strategies.deck.setEndIdx(260)
    this.tableActions.next({
      action: Actions.burnCardup,
      card: this.strategies.deck.getCard()
    })
  }

  private step2() {
    this.dealerUpdate(Actions.startHand)
    this.getValidPlayers().forEach(p => {
      const result = p.cb && p.cb({
        action: Actions.startHand,
        maxBet: this.strategies.bet.getMax(),
        minBet: this.strategies.bet.getMin(),
      })
      if (!result) {
        p.sittingOut = true
        return
      }
      this.tableActions.next({ action: Actions.playerBetAmount, amount: result.amount, player: p })
    })
  }
  private step3() {
    this.dealCardsOnce()
    this.dealCardsOnce()
    this.tableActions.next({
      action: Actions.exposeDealerCard,
      card: this.dealer.cards[0]
    })
  }
  private step4() {
    if (this.strategies.insurance.valid(this.dealer.cards[0], this.dealer.cards[1])) {
      this.getValidPlayers().forEach(p => {
        const amount = this.strategies.insurance.amount(p.bet)
        const result = p.cb && p.cb({ action: Actions.insurance, amount })
        if (result?.amount === amount) {
          p.insuranceBet = result.amount
        }
      })
    }
  }
  private step5() {
    if (Hand.isNatural(this.dealer.cards)) {
      this.getValidPlayers().forEach(p => {
        if (p.insuranceBet) {
          this.tableActions.next({ action: Actions.collectBet, player: p })
          p.cb && p.cb({ action: Actions.collectBet })
          this.tableActions.next({ action: Actions.insurancePayout, player: p })
          p.cb && p.cb({
            action: Actions.insurancePayout,
            amount: this.strategies.insurance.payout(p.insuranceBet)
          })
        } else if (!Hand.isNatural(p.getInfo().cards)) {
          this.tableActions.next({ action: Actions.collectBet, player: p })
          p.cb && p.cb({ action: Actions.collectBet })
        } else {
          this.tableActions.next({ action: Actions.push, player: p })
          p.cb && p.cb({ action: Actions.push })
        }
      })
    } else {
      this.getValidPlayers().forEach(p => {
        while (true) {
          const result = p.cb && p.cb({ action: Actions.playHand, availableActions: this.getAvailableActions(p) })
          switch (result?.action) {
            case Actions.stand:
              this.tableActions.next({ action: Actions.stand, player: p })
              break
            case Actions.hit:
              this.tableActions.next({ action: Actions.hit, player: p })
              const cardHit = this.getCard(p)
              p.cb && p.cb({ action: Actions.playerCardUp, card: cardHit })
              this.tableActions.next({ action: Actions.playerCardUp, card: cardHit, player: p })
              const values1 = Hand.getHandValues(p.cards)
              if (this.checkHandBust(values1)) {
                p.cb && p.cb({ action: Actions.bust })
                this.tableActions.next({ action: Actions.bust, player: p })
              }
              break
            case Actions.doubleDown:
              this.tableActions.next({ action: Actions.doubleDown, player: p })
              const card = this.getCard(p)
              p.cb && p.cb({ action: Actions.playerCardUp, card })
              this.tableActions.next({ action: Actions.playerCardUp, card, player: p })
              const values2 = Hand.getHandValues(p.cards)
              if (this.checkHandBust(values2)) {
                p.cb && p.cb({ action: Actions.bust })
                this.tableActions.next({ action: Actions.bust, player: p })
              }
              break
            case Actions.split:
              // TODO
              // this.tableActions.next({ action: Actions.SPLIT, player: p });
              break
          }
        }
      })
    }
  }
  private step6() {
    this.tableActions.next({ action: Actions.endHand })
  }
  private step7() {
    this.tableActions.next({ action: Actions.endGame })
  }
  private checkHandBust(values: number[]) {
    return values.filter(x => x <= 21).length === values.length
  }
  private getCard(p: Player): Card {
    let card = this.strategies.deck.getCard()
    if (!card) {
      this.tableActions.next({ action: Actions.lastHand })
      card = this.strategies.deck.getCard()
      this.readyToShuffle = true
    }
    p.cb && p.cb({ action: Actions.playerCardUp, card })
    this.tableActions.next({ action: Actions.playerCardUp, card, player: p })
    if(!card) {
      return new Card(Rank.Joker, Suit.Joker);
    }
    return card;
  }
  private dealCardsOnce() {
    const dealerCard = this.strategies.deck.getCard()
    this.tableActions.next({ action: Actions.dealerCardDown, card: dealerCard })
    this.dealer.action(Actions.dealerCardDown, dealerCard|| new Card(Rank.Joker, Suit.Joker))
    this.getValidPlayers().forEach(p => {
      let card = this.strategies.deck.getCard()
      if (!card) {
        this.tableActions.next({ action: Actions.lastHand })
        card = this.strategies.deck.getCard()
        this.readyToShuffle = true
      }
      p.cb && p.cb({ action: Actions.playerCardUp, card })
      this.tableActions.next({ action: Actions.playerCardUp, card, player: p })
    })
  }
}

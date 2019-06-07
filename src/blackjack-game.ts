const defaults = require('lodash/defaults')
const SixDeckStrategy = require('./sixdeck-strategy')
const BetsStrategy = require('./bets-strategy')
const InsuranceStrategy = require('./insurance-strategy')
const DoubleDownStrategy = require('./doubledown-strategy')
const DealerStrategy = require('./dealer-strategy')
const PayoutStrategy = require('./payout-strategy')
const SplitStrategy = require('./split-strategy')
const TableStrategy = require('./table-strategy')
const Dealer = require('./dealer')
const BlackjackFlow = require('./blackjack-flow')
const Hand = require('./hand')
const actions = require('./actions')
const { Subject } = require('rxjs')

export default class BlackjackGame {
  constructor (strategies = {}) {
    this.strategies = {}
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
    this.gameFlow = new BlackjackFlow()
  }

  start () {
    if (this.getValidPlayers().length === 0) {
      return false
    }
    this.gameFlow.step1(this)
    this.gameFlow.step2(this)
    while (!this.readyToShuffle) {
      this.gameFlow.step3(this)
      this.gameFlow.step4(this)
      this.gameFlow.step5(this)
      this.gameFlow.step6(this)
    }
    this.gameFlow.step7(this)
    return true
  }

  getValidPlayers () {
    return this.players.filter(x => x && !x.sittingOut)
  }

  addPlayer (player, position) {
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
    this.players[position - 1] = { player }
  }

  subscribeTableActions (cb) {
    if (!cb || typeof cb !== 'function') {
      return new Error('invalid callback')
    }
    return this.tableActions.subscribe(cb)
  }

  subscribePlayerActions (player, cb) {
    const p = this.players.find(x => player === x.player)
    if (!p || !cb || typeof cb !== 'function') {
      return new Error('invalid player or invalid callback')
    }
    p.cb = cb
    return this.playerAction.subscribe(cb)
  }

  getAvailableActions (player) {
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
      return
    }
    if (!Hand.checkHandBust(handValues)) {
      results.push(actions.HIT)
      results.push(actions.STAND)
    }
  }
}

const actions = require('./actions')
// const HandHelper = require('./player-hand-helper')
const Hand = require('./hand')

module.exports = class Player {
  constructor ({ name, money }) {
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
  getInfo () {
    return {
      position: this.position,
      name: this.name,
      money: this.money,
      bet: this.bet,
      cardHistory: [],
      cards: ''
    }
  }
  tableAction (data) {
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
  playerAction (data) {
    switch (data.action) {
      case actions.START_HAND:
        this.cards = []
        if (this.money < data.minBet) {
          return null
        }
        this.money -= data.minBet
        this.bet = data.minBet
        return this.bet
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
        this.money += this.bet
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

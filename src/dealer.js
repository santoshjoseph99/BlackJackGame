const actions = require('./actions')

module.exports = class Dealer {
  constructor () {
    this.cards = []
  }
  action (action, data) {
    // console.log('--', action, data)
    if (action === actions.DEALER_CARD_DOWN ||
       action === actions.DEALER_CARD_UP) {
      this.cards.push(data)
    } else if (action === actions.START_HAND) {
      this.cards = []
    } else {
      console.log('?')
    }
  }
}

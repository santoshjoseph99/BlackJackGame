const Hand = require('./hand')

module.exports = class SplitStrategy {
  valid (cards) {
    if (cards.length > 2) {
      return false
    }
    const [card1, card2] = cards
    return card1.rank === card2.rank ||
      (Hand.isCardTen(card1) && Hand.isCardTen(card2))
  }
}

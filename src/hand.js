const cloneDeep = require('lodash/cloneDeep')
const uniq = require('lodash/uniq')

module.exports = class Hand {
  static canSplitHand (cards, strategy) {
    return strategy.valid(cards)
  }

  static canDoubleDown (cards, strategy) {
    return strategy.valid(cards)
  }

  static isSoft (cards) {
    if (cards.length === 2 && Hand.hasAce(cards)) {
      return true
    }
    return false
  }

  static isHard (cards) {
    if (cards.length === 2 && !Hand.hasAce(cards)) {
      return true
    }
    return false
  }

  static getCardValue (card) {
    let cardValue = null
    if (Hand.isCardTen(card)) {
      cardValue = 10
    }
    if (!cardValue) {
      cardValue = parseInt(card.rank)
    }
    return cardValue
  }

  static hasAce (cards) {
    return cards.some(Hand.isAce)
  }

  static isAce (card) {
    return card.rank === 'a'
  }

  static hasBlackjack (values) {
    return values.some(x => x === 21)
  }

  static isCardTen (card) {
    return card.rank === 't' ||
           card.rank === 'j' ||
           card.rank === 'q' ||
           card.rank === 'k'
  }

  static isNatural (cards) {
    if (cards.length > 2) return false
    return (cards[0].rank === 'a' && Hand.isCardTen(cards[1])) ||
           (cards[1].rank === 'a' && Hand.isCardTen(cards[0]))
  }

  static checkHandBust (values) {
    return values.filter(x => x <= 21).length === values.length
  }

  static getHands (cards) {
    let results = []
    Hand.getHandsHelper(cards, results)
    if (results.length === 0) results.push(cards)
    return results
  }

  static getHandsHelper (cards, results) {
    for (let i = 0; i < cards.length; i++) {
      if (Hand.isAce(cards[i])) {
        let cardsLow = cloneDeep(cards)
        cardsLow[i].rank = '1'
        let cardsHigh = cloneDeep(cards)
        cardsHigh[i].rank = '11'
        if (!cardsLow.find(Hand.isAce)) {
          results.push(cardsLow)
        } else {
          Hand.getHandsHelper(cardsLow, results)
        }
        if (!cardsHigh.find(Hand.isAce)) {
          results.push(cardsHigh)
        } else {
          Hand.getHandsHelper(cardsHigh, results)
        }
      }
    }
  }

  static getHandValue (cards) {
    return cards.reduce((acc, card) => { return acc + Hand.getCardValue(card) }, 0)
  }

  static getHandValues (cards) {
    const handsList = Hand.getHands(cards)
    const handValues = handsList.map(list => Hand.getHandValue(list))
    return uniq(handValues)
  }
}

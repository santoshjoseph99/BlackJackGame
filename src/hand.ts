import cloneDeep from 'lodash/cloneDeep';
import uniq from 'lodash/uniq';
import { Card } from 'deckjs';
import ISplitStrategy from './interfaces/isplit-strategy';
import IDoubleDownStrategy from './interfaces/idoubledown-strategy';

export default class Hand {
  public static canSplitHand (cards:Card[], strategy:ISplitStrategy) {
    return strategy.valid(cards)
  }

  public static canDoubleDown (cards:Card[], strategy:IDoubleDownStrategy) {
    return strategy.valid(cards)
  }

  public static isSoft (cards:Card[]) {
    if (cards.length === 2 && Hand.hasAce(cards)) {
      return true
    }
    return false
  }

  public static isHard (cards:Card[]) {
    if (cards.length === 2 && !Hand.hasAce(cards)) {
      return true
    }
    return false
  }

  public static getCardValue (card:Card) {
    let cardValue = null
    if (Hand.isCardTen(card)) {
      cardValue = 10
    }
    if (!cardValue) {
      cardValue = parseInt(card.rank, 10)
    }
    return cardValue
  }

  public static hasAce (cards:Card[]) {
    return cards.some(Hand.isAce)
  }

  public static isAce (card:Card) {
    return card.rank === 'a'
  }

  public static hasBlackjack (values:number[]) {
    return values.some(x => x === 21)
  }

  public static isCardTen (card:Card) {
    return card.rank === 't' ||
           card.rank === 'j' ||
           card.rank === 'q' ||
           card.rank === 'k'
  }

  public static isNatural (cards:Card[]) {
    if (cards.length > 2) { return false }
    return (cards[0].rank === 'a' && Hand.isCardTen(cards[1])) ||
           (cards[1].rank === 'a' && Hand.isCardTen(cards[0]))
  }

  public static checkHandBust (values:number[]) {
    return values.filter(x => x <= 21).length === values.length
  }

  public static getHands (cards:Card[]) {
    const results:Card[][] = [];
    Hand.getHandsHelper(cards, results)
    if (results.length === 0) {
      results.push(cards)
    }
    return results
  }

  public static getHandsHelper (cards:Card[], results:Card[][]) {
    for (let i = 0; i < cards.length; i++) {
      if (Hand.isAce(cards[i])) {
        const cardsLow = cloneDeep(cards)
        cardsLow[i].rank = '1'
        const cardsHigh = cloneDeep(cards)
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

  public static getHandValue (cards:Card[]) {
    return cards.reduce((acc, card) => acc + Hand.getCardValue(card), 0)
  }

  public static getHandValues (cards:Card[]) {
    const handsList = Hand.getHands(cards)
    const handValues = handsList.map(list => Hand.getHandValue(list))
    return uniq(handValues)
  }
}

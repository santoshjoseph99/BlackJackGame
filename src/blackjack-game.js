const defaults = require('lodash/defaults')
const cloneDeep = require('lodash/cloneDeep')
const uniq = require('lodash/uniq')
const SixDeckStrategy = require('./sixdeck-strategy')
const actions = require('./actions')
const { Subject } = require('rxjs')

class DefaultSplitStrategy {
  split (card1, card2) {

  }
}

class DefaultDoubleDownStrategy {
  check (card1, card2) {
    return true
  }
};

class DefaultInsuranceStrategy {
  insuranceAvailable(upCard, downCard) {
    return upCard.rank === 'a'
  }
  amount(bet) {
    return Math.ceil(bet/2);
  }
  payout(bet) {
    return bet * 2
  }
};

class DefaultDealerStrategy {
  dealCardsUp () {
    return true
  }
  
};

class DefaultPayoutStrategy {
  getPayout (bet, blackjack) {
    return Math.ceil((bet * 3) / 2)
  }
};

class DefaultBetsStrategy {
  getMin () {
    return 10
  }
  getMax () {
    return 100
  }
}

class BlackjackGame {
  constructor (strategies = {}) {
    this.strategies = {}
    this.strategies.insurance = new DefaultInsuranceStrategy()
    this.strategies.doubleDown = new DefaultDoubleDownStrategy()
    this.strategies.dealer = new DefaultDealerStrategy()
    this.strategies.payout = new DefaultPayoutStrategy()
    this.strategies.deck = new SixDeckStrategy()
    this.strategies.bet = new DefaultBetsStrategy()
    this.strategies.split = new DefaultSplitStrategy()
    this.readyToShuffle = false
    defaults(strategies, this.strategies)
    this.dealer = {
      cards: [],
      action: (action, obj) => {
        if (action === actions.DEALER_CARD_DOWN ||
           action === actions.DEALER_CARD_UP) {
          this.cards.push(obj)
        } else if (action === actions.START_HAND) {
          this.cards = []
        }
      }
    }
    this.tableActions = new Subject()
    this.playerAction = new Subject()
    this.players = []
    this.maxPlayers = 7
  }

  addPlayer (player, position) {
    if (position > this.maxPlayers || position < 0) {
      return new Error(`position must be 1 and ${this.maxPlayers}`)
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

  getBets () {
    this.dealer.action(actions.START_HAND)
    this.getValidPlayers().forEach(p => {
      const bet = p.cb({ action: actions.START_HAND })
      if (!bet) {
        p.sittingOut = true
        return
      }
      p.bet = bet
      this.tableActions.next({ action: actions.PLAYER_BET_AMOUNT, amount: bet, player: p })
    })
  }

  dealCards () {
    const dealerUpCard = this.strategies.deck.getCard()
    this.tableActions.next({ action: actions.DEALER_CARD_DOWN, card: dealerUpCard })
    this.dealer.action(actions.DEALER_CARD_DOWN, dealerUpCard)
    this.getValidPlayers().forEach(p => {
      const card = this.strategies.deck.getCard()
      p.cb({ action: actions.PLAYER_CARD_UP, card: card })
      this.tableActions.next({ action: actions.PLAYER_CARD_UP, card: card, player: p })
    })
    const dealerDownCard = this.strategies.deck.getCard()
    this.tableActions.next({ action: actions.DEALER_CARD_DOWN, card: dealerUpCard })
    this.dealer.action(actions.DEALER_CARD_DOWN, dealerDownCard)
    this.getValidPlayers().forEach(p => {
      const card = this.strategies.deck.getCard()
      p.cb({ action: actions.PLAYER_CARD_UP, card: card })
      this.tableActions.next({ action: actions.PLAYER_CARD_UP, card: card, player: p })
    })
    this.tableActions.next({ action: actions.EXPOSE_DEALER_CARD, card: this.dealer.card[0] })
  }

  handleInsurance () {

  }

  handleBlackjack () {

  }

  start () {
    this.tableActions.next({ action: actions.START_GAME })
    this.strategies.deck.shuffleDeck()
    this.tableActions.next({
      action: actions.BURN_CARD_UP,
      card: this.burnCard()
    })
    while (true) {
      this.getBets()
      this.dealCards()
      if (this.strategies.insurance.insuranceAvailable(...this.dealer.cards)) {
        this.getValidPlayers().forEach(p => {
          const amount = this.strategies.insurance.amount(p.bet)
          let insuranceAmount = p.cb({ action: actions.INSURANCE, amount })
          if(insuranceAmount === amount) {
            p.insuranceBet = insuranceAmount;
          }
        })
      }
      if(this.isNatural(this.dealer.cards)){
        this.getValidPlayers().forEach(p => {
          if(p.insuranceBet) {
            p.cb({action:actions.COLLECT_BET})
            p.cb({
              action:actions.INSURANCE_PAYOUT,
              amount: this.strategies.insurance.payout(p.insuranceAmount)
            })
          } else if(!this.isNatural(p.getInfo().cards)) {
            p.cb({action:actions.COLLECT_BET})
          } else {
            p.cb({action:actions.PUSH});
          }
        });
      } else {
        this.getValidPlayers().forEach(p => {
          while(true) {
            let result = p.cb({availableActions: this.getAvailableActions()})
            switch(result.action) {
              case actions.STAND:
              break;
              case actions.HIT:
              break;
              case actions.DOUBLE_DOWN:
              break;
              case actions.SPLIT:
              break;
            }
          }
        });

      }
    }
  }

  getValidPlayers () {
    return this.players.filter(x => x && !x.sittingOut)
  }
  /*
  start2 (players) {
    players.forEach(p => p.startGame())
    this.strategies.deck.shuffleDeck()
    this.burnCard()
    while (true) {
      players.forEach(p => p.startHand())
      this.dealCards(players)
      this.exposeDealerCard()
      this.checkForInsurance(players)
      if (!this.dealerBlackjack()) {
        // this.checkForNaturals(players);
        players.forEach(p => this.playHand(p))
        this.handlePayOuts(players, false)
      } else {
        this.checkForNaturals(players)
        this.handlePayOuts(players, true)
      }
      if (!this.isGamePlayable(players, this.strategies.deck)) {
        break
      }
      players.forEach(p => p.endHand())
    }
    players.forEach(p => p.endGame())
  }

  handlePayOuts (players, dealerBlackjack) {

  }

  dealerBlackjack () {
    return this.isNatural(this.dealer.cards)
  }

  exposeDealerCard (players) {
    players.forEach(p => p.dealerUpCard(this.dealer.cards[0]))
  }

  dealCard (obj) {
    const faceUp = this.strategies.deck.dealFaceUp()
    const c = this.strategies.deck.getCard()
    if (c) {
      obj.dealCard(c, faceUp)
    } else {
      obj.dealCard(this.strategies.deck.getCard(), faceUp)
      this.readyToShuffle = true
    }
  }

  dealCards (players) {
    this.dealCard(this.dealer)
    players.forEach(p => {
      this.dealCard(p)
    })
    this.dealCard(this.dealer)
    players.forEach(p => {
      this.dealCard(p)
    })
    if (this.readyToShuffle) {
      players.forEach(p => p.readyToShuffle())
    }
  }

  isGamePlayable (players) {
    if (this.readyToShuffle) {
      return false
    }
  }

  burnCard () {
    return this.strategies.deck.getCard()
  }

  checkForInsurance (players) {
    const [upCard, downCard] = this.dealer.cards
    if (this.strategies.insurance.offerInsurance(upCard, downCard)) {
      players.forEach(p => p.offerInsurance())
    }
  }

  playHand (p) {
    while (true) {
      let action = p.playerAction(null, availableActions)
      if (action === constants.HIT) {

      } else if (action === constants.STAND) {

      } else if (action === constants.DOUBLE_DOWN) {

      } else if (action === constants.SPLIT) {

      }
    }
  }

  getPlayerAvailableActions (p) {
    const hands = p.getHand()
    const idx = p.getCurrentHandIdx()
    const hand = hands[idx]
  }
*/
  canSplitHand (cards) {
    return cards[0].rank === cards[1].rank ||
       (this.isCardTen(cards[0]) && this.isCardTen(cards[1]))
  }

  getCardValue (card) {
    let cardValue = null
    if (this.isCardTen(card)) {
      cardValue = 10
    }
    if (!cardValue) {
      cardValue = parseInt(card.rank)
    }
    return cardValue
  }

  isAce (card) {
    return card.rank === 'a'
  }

  isCardTen (card) {
    return card.rank === 't' ||
           card.rank === 'j' ||
           card.rank === 'q' ||
           card.rank === 'k'
  }

  isNatural (cards) {
    if (cards.length > 2) return false
    return (cards[0].rank === 'a' && this.isCardTen(cards[1])) ||
           (cards[1].rank === 'a' && this.isCardTen(cards[0]))
  }

  getHands (cards) {
    let results = []
    this.getHandsHelper(cards, results)
    if (results.length === 0) results.push(cards)
    return results
  }

  getHandsHelper (cards, results) {
    for (let i = 0; i < cards.length; i++) {
      if (this.isAce(cards[i])) {
        let cardsLow = cloneDeep(cards)
        cardsLow[i].rank = '1'
        let cardsHigh = cloneDeep(cards)
        cardsHigh[i].rank = '11'
        if (!cardsLow.find(this.isAce)) {
          results.push(cardsLow)
        } else {
          this.getHandsHelper(cardsLow, results)
        }
        if (!cardsHigh.find(this.isAce)) {
          results.push(cardsHigh)
        } else {
          this.getHandsHelper(cardsHigh, results)
        }
      }
    }
  }

  getHandValue (cards) {
    return cards.reduce((acc, card) => { return acc + this.getCardValue(card) }, 0)
  }

  getHandValues (cards) {
    let handsList = this.getHands(cards)
    let handValues = handsList.map(list => this.getHandValue(list))
    return uniq(handValues)
  }
}

module.exports = BlackjackGame

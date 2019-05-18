const defaults = require('lodash/defaults')
const SixDeckStrategy = require('./sixdeck-strategy')
const Hand = require('./hand')
const actions = require('./actions')
const { Subject } = require('rxjs')

class Dealer {
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

class BlackjackFlow {
  step1 (game) {
    game.tableUpdate({ action: actions.START_GAME })
    game.deck.shuffleDeck()
    game.tableUpdate({ action: actions.SHUFFLE })
    game.deck.setEndIdx(game.strategies.table.getEndDeckIndex())
    game.tableUpdate({ action: actions.SET_END_CARD })
    game.strategies.deck.setEndIdx(260)
    game.tableUpdate({
      action: actions.BURN_CARD_UP,
      card: game.strategies.deck.getCard()
    })
  }
  step2 (game) {
    game.dealerUpdate(actions.START_HAND)
    game.getValidPlayers().forEach(p => {
      const bet = p.cb(this, { action: actions.START_HAND })
      if (!bet) {
        p.sittingOut = true
        return
      }
      p.bet = bet
      game.tableUpdate({ action: actions.PLAYER_BET_AMOUNT, amount: bet, player: p })
    })
  }
  step3 (game) {
    this.dealCardsOnce(game)
    this.dealCardsOnce(game)
    game.tableUpdate({
      action: actions.EXPOSE_DEALER_CARD,
      card: game.dealer.cards[0]
    })
  }
  step4 (game) {
    if (game.strategies.insurance.insuranceAvailable(...game.dealer.cards)) {
      game.getValidPlayers().forEach(p => {
        const amount = game.strategies.insurance.amount(p.bet)
        let insuranceAmount = p.cb({ action: actions.INSURANCE, amount })
        if (insuranceAmount === amount) {
          p.insuranceBet = insuranceAmount
        }
      })
    }
  }
  step5 (game) {
    if (game.isNatural(game.dealer.cards)) {
      game.getValidPlayers().forEach(p => {
        if (p.insuranceBet) {
          p.cb({ action: actions.COLLECT_BET })
          p.cb({
            action: actions.INSURANCE_PAYOUT,
            amount: game.strategies.insurance.payout(p.insuranceAmount)
          })
        } else if (!game.isNatural(p.getInfo().cards)) {
          p.cb({ action: actions.COLLECT_BET })
        } else {
          p.cb({ action: actions.PUSH })
        }
      })
    } else {
      game.getValidPlayers().forEach(p => {
        while (true) {
          const result = p.cb({ availableActions: game.getAvailableActions(p) })
          switch (result.action) {
            case actions.STAND:
              game.tableActions({ action: actions.STAND, player: p })
              break
            case actions.HIT:
              game.tableActions({ action: actions.HIT, player: p })
              const card = this.getCard(game, p)
              p.cb({ action: actions.PLAYER_CARD_UP, card })
              game.tableActions({ action: actions.PLAYER_CARD_UP, card, player: p })
              const values1 = Hand.getHandValues(p.cards)
              if (this.checkHandBust(values1)) {
                p.cb({ action: actions.BUST })
                game.tableActions({ action: actions.BUST, player: p })
                break
              }
              break
            case actions.DOUBLE_DOWN:
              game.tableActions({ action: actions.DOUBLE_DOWN, player: p })
              p.cb({ action: actions.PLAYER_CARD_UP, card })
              game.tableActions({ action: actions.PLAYER_CARD_UP, card, player: p })
              const values2 = Hand.getHandValues(p.cards)
              if (this.checkHandBust(values2)) {
                p.cb({ action: actions.BUST })
                game.tableActions({ action: actions.BUST, player: p })
              }
              break
            case actions.SPLIT:
              // game.tableActions({ action: actions.SPLIT, player: p });
              break
          }
        }
      })
    }
  }
  step6 (game) {
    game.tableUpdate({ action: actions.END_HAND })
  }
  step7 (game) {
    game.tableUpdate({ action: actions.END_GAME })
  }
  checkHandBust (values) {
    return values.filter(x => x <= 21).length === values.length
  }
  getCard (game, p) {
    let card = game.strategies.deck.getCard()
    if (!card) {
      game.tableUpdate({ action: actions.LAST_HAND })
      card = game.strategies.deck.getCard()
      game.readyToShuffle = true
    }
    p.cb({ action: actions.PLAYER_CARD_UP, card: card })
    game.tableUpdate({ action: actions.PLAYER_CARD_UP, card: card, player: p })
  }
  dealCardsOnce (game) {
    const dealerCard = game.strategies.deck.getCard()
    game.tableUpdate({ action: actions.DEALER_CARD_DOWN, card: dealerCard })
    game.dealer.action(actions.DEALER_CARD_DOWN, dealerCard)
    game.getValidPlayers().forEach(p => {
      let card = game.strategies.deck.getCard()
      if (!card) {
        game.tableUpdate({ action: actions.LAST_HAND })
        card = game.strategies.deck.getCard()
        game.readyToShuffle = true
      }
      p.cb({ action: actions.PLAYER_CARD_UP, card: card })
      game.tableUpdate({ action: actions.PLAYER_CARD_UP, card: card, player: p })
    })
  }
}

class DefaultTableStrategy {
  maxPlayers () {
    return 7
  }
  getEndDeckIndex () {
    return 260
  }
}

class DefaultSplitStrategy {
  valid (cards) {
    if (cards.length > 2) {
      return false
    }
    const [card1, card2] = cards
    return card1.rank === card2.rank ||
      (Hand.isCardTen(card1) && Hand.isCardTen(card2))
  }
}

class DefaultDoubleDownStrategy {
  valid (cards) {
    if (cards.length > 2) {
      return false
    }
    return true
  }
};

class DefaultInsuranceStrategy {
  valid (upCard, downCard) {
    return upCard.rank === 'a'
  }
  amount (bet) {
    return Math.ceil(bet / 2)
  }
  payout (bet) {
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
    return blackjack ? Math.ceil((bet * 3) / 2) : bet
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
    this.strategies.table = new DefaultTableStrategy()
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
    const { cards, money, currentBet } = player.getInfo()

    if (this.strategies.split.valid(cards)) {
      if (money >= currentBet) {
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
/*
class BlackjackGame2 {
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
      action: (action, data) => {
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
    this.tableActions = new Subject()
    this.playerAction = new Subject()
    this.players = []
    this.maxPlayers = 7
  }

  addPlayer (player, position) {
    if (position > this.maxPlayers || position < 0) {
      return new Error(`position must be 1 and ${this.maxPlayers}`)
    }
    if(this.players[position]) {
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

  getBets () {
    this.dealer.action(actions.START_HAND)
    this.getValidPlayers().forEach(p => {
      const bet = p.cb(this, { action: actions.START_HAND })
      if (!bet) {
        p.sittingOut = true
        return
      }
      p.bet = bet
      this.tableActions.next({ action: actions.PLAYER_BET_AMOUNT, amount: bet, player: p })
    })
  }

  dealCardsOnce () {
    const dealerCard = this.strategies.deck.getCard()
    this.tableActions.next({ action: actions.DEALER_CARD_DOWN, card: dealerCard })
    this.dealer.action(actions.DEALER_CARD_DOWN, dealerCard)
    this.getValidPlayers().forEach(p => {
      let card = this.strategies.deck.getCard()
      if (!card) {
        this.tableActions.next({ action: actions.LAST_HAND })
        card = this.strategies.deck.getCard()
        this.readyToShuffle = true
      }
      p.cb({ action: actions.PLAYER_CARD_UP, card: card })
      this.tableActions.next({ action: actions.PLAYER_CARD_UP, card: card, player: p })
    })
  }

  dealCards () {
    this.dealCardsOnce()
    this.dealCardsOnce()
    this.tableActions.next({
      action: actions.EXPOSE_DEALER_CARD,
      card: this.dealer.cards[0]
    })
  }

  handleInsurance () {

  }

  handleBlackjack () {

  }

  step1() {
    this.tableActions.next({ action: actions.START_GAME })
    this.strategies.deck.shuffleDeck()
    this.tableActions.next({ action: actions.SHUFFLE})
    this.strategies.deck.setEndIdx(260)
    this.tableActions.next({ action: actions.SET_END_CARD})
    this.tableActions.next({
      action: actions.BURN_CARD_UP,
      card: this.burnCard()
    })
  }

  step2() {
    this.getBets();
  }

  step3() {
    this.dealCards();
  }

  start () {
    if(this.getValidPlayers().length === 0) {
      return false;
    }
    step1();
    while (true) {
      step2();
      step3();
      if (this.strategies.insurance.insuranceAvailable(...this.dealer.cards)) {
        this.getValidPlayers().forEach(p => {
          const amount = this.strategies.insurance.amount(p.bet)
          let insuranceAmount = p.cb({ action: actions.INSURANCE, amount })
          if (insuranceAmount === amount) {
            p.insuranceBet = insuranceAmount
          }
        })
      }
      if (this.isNatural(this.dealer.cards)) {
        this.getValidPlayers().forEach(p => {
          if (p.insuranceBet) {
            p.cb({ action: actions.COLLECT_BET })
            p.cb({
              action: actions.INSURANCE_PAYOUT,
              amount: this.strategies.insurance.payout(p.insuranceAmount)
            })
          } else if (!this.isNatural(p.getInfo().cards)) {
            p.cb({ action: actions.COLLECT_BET })
          } else {
            p.cb({ action: actions.PUSH })
          }
        })
      } else {
        this.getValidPlayers().forEach(p => {
          while (true) {
            let result = p.cb({ availableActions: this.getAvailableActions() })
            switch (result.action) {
              case actions.STAND:
                break
              case actions.HIT:
                break
              case actions.DOUBLE_DOWN:
                break
              case actions.SPLIT:
                break
            }
          }
        })
      }
    }
    return true;
  }

  burnCard () {
    return this.strategies.deck.getCard()
  }

  getValidPlayers () {
    return this.players.filter(x => x && !x.sittingOut)
  }

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
*/
module.exports = BlackjackGame

const Hand = require('./hand')
const actions = require('./actions')

module.exports = class BlackjackFlow {
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
      const bet = p.cb(this, {
        action: actions.START_HAND,
        minBet: game.strategies.bet.getMin(),
        maxBet: game.strategies.bet.getMax()
      })
      if (!bet) {
        p.sittingOut = true
        return
      }
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
          game.tableActions({ action: actions.COLLECT_BET, player: p })
          p.cb({ action: actions.COLLECT_BET })
          game.tableActions({ action: actions.INSURANCE_PAYOUT, player: p })
          p.cb({
            action: actions.INSURANCE_PAYOUT,
            amount: game.strategies.insurance.payout(p.insuranceAmount)
          })
        } else if (!game.isNatural(p.getInfo().cards)) {
          game.tableActions({ action: actions.COLLECT_BET, player: p })
          p.cb({ action: actions.COLLECT_BET })
        } else {
          game.tableActions({ action: actions.PUSH, player: p })
          p.cb({ action: actions.PUSH })
        }
      })
    } else {
      game.getValidPlayers().forEach(p => {
        while (true) {
          const result = p.cb({ action: actions.PLAY_HAND, availableActions: game.getAvailableActions(p) })
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
              // TODO
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

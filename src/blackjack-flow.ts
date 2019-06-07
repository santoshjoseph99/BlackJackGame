import Actions from './Actions';
import IBlackjackGame from './iblackjack-game';
import Hand from './hand';

export default class BlackjackFlow {
  public step1 (game:IBlackjackGame) {
    game.tableUpdate({ action: Actions.START_GAME })
    game.deck.shuffleDeck()
    game.tableUpdate({ action: Actions.SHUFFLE })
    game.deck.setEndIdx(game.strategies.table.getEndDeckIndex())
    game.tableUpdate({ action: Actions.SET_END_CARD })
    game.strategies.deck.setEndIdx(260)
    game.tableUpdate({
      action: Actions.BURN_CARD_UP,
      card: game.strategies.deck.getCard()
    })
  }
  public step2 (game:IBlackjackGame) {
    game.dealerUpdate(Actions.START_HAND)
    game.getValidPlayers().forEach(p => {
      const bet = p.cb(this, {
        action: Actions.START_HAND,
        minBet: game.strategies.bet.getMin(),
        maxBet: game.strategies.bet.getMax()
      })
      if (!bet) {
        p.sittingOut = true
        return
      }
      game.tableUpdate({ action: Actions.PLAYER_BET_AMOUNT, amount: bet, player: p })
    })
  }
  public step3 (game:IBlackjackGame) {
    this.dealCardsOnce(game)
    this.dealCardsOnce(game)
    game.tableUpdate({
      action: Actions.EXPOSE_DEALER_CARD,
      card: game.dealer.cards[0]
    })
  }
  public step4 (game:IBlackjackGame) {
    if (game.strategies.insurance.insuranceAvailable(...game.dealer.cards)) {
      game.getValidPlayers().forEach(p => {
        const amount = game.strategies.insurance.amount(p.bet)
        let insuranceAmount = p.cb({ action: Actions.INSURANCE, amount })
        if (insuranceAmount === amount) {
          p.insuranceBet = insuranceAmount
        }
      })
    }
  }
  public step5 (game:IBlackjackGame) {
    if (game.isNatural(game.dealer.cards)) {
      game.getValidPlayers().forEach(p => {
        if (p.insuranceBet) {
          game.tableActions({ action: Actions.COLLECT_BET, player: p })
          p.cb({ action: Actions.COLLECT_BET })
          game.tableActions({ action: Actions.INSURANCE_PAYOUT, player: p })
          p.cb({
            action: Actions.INSURANCE_PAYOUT,
            amount: game.strategies.insurance.payout(p.insuranceAmount)
          })
        } else if (!game.isNatural(p.getInfo().cards)) {
          game.tableActions({ action: Actions.COLLECT_BET, player: p })
          p.cb({ action: Actions.COLLECT_BET })
        } else {
          game.tableActions({ action: Actions.PUSH, player: p })
          p.cb({ action: Actions.PUSH })
        }
      })
    } else {
      game.getValidPlayers().forEach(p => {
        while (true) {
          const result = p.cb({ action: Actions.PLAY_HAND, availableActions: game.getAvailableActions(p) })
          switch (result.action) {
            case Actions.STAND:
              game.tableActions({ action: Actions.STAND, player: p })
              break
            case Actions.HIT:
              game.tableActions({ action: Actions.HIT, player: p })
              const card = this.getCard(game, p)
              p.cb({ action: Actions.PLAYER_CARD_UP, card })
              game.tableActions({ action: Actions.PLAYER_CARD_UP, card, player: p })
              const values1 = Hand.getHandValues(p.cards)
              if (this.checkHandBust(values1)) {
                p.cb({ action: Actions.BUST })
                game.tableActions({ action: Actions.BUST, player: p })
              }
              break
            case Actions.DOUBLE_DOWN:
              game.tableActions({ action: Actions.DOUBLE_DOWN, player: p })
              p.cb({ action: Actions.PLAYER_CARD_UP, card })
              game.tableActions({ action: Actions.PLAYER_CARD_UP, card, player: p })
              const values2 = Hand.getHandValues(p.cards)
              if (this.checkHandBust(values2)) {
                p.cb({ action: Actions.BUST })
                game.tableActions({ action: Actions.BUST, player: p })
              }
              break
            case Actions.SPLIT:
              // TODO
              // game.tableActions({ action: Actions.SPLIT, player: p });
              break
          }
        }
      })
    }
  }
  public step6 (game:IBlackjackGame) {
    game.tableUpdate({ action: Actions.END_HAND })
  }
  public step7 (game:IBlackjackGame) {
    game.tableUpdate({ action: Actions.END_GAME })
  }
  private checkHandBust (values) {
    return values.filter(x => x <= 21).length === values.length
  }
  private getCard (game:IBlackjackGame, p:Player) {
    let card = game.strategies.deck.getCard()
    if (!card) {
      game.tableUpdate({ action: Actions.LAST_HAND })
      card = game.strategies.deck.getCard()
      game.readyToShuffle = true
    }
    p.cb({ action: Actions.PLAYER_CARD_UP, card: card })
    game.tableUpdate({ action: Actions.PLAYER_CARD_UP, card: card, player: p })
  }
  private dealCardsOnce (game:IBlackjackGame) {
    const dealerCard = game.strategies.deck.getCard()
    game.tableUpdate({ action: Actions.DEALER_CARD_DOWN, card: dealerCard })
    game.dealer.action(Actions.DEALER_CARD_DOWN, dealerCard)
    game.getValidPlayers().forEach(p => {
      let card = game.strategies.deck.getCard()
      if (!card) {
        game.tableUpdate({ action: Actions.LAST_HAND })
        card = game.strategies.deck.getCard()
        game.readyToShuffle = true
      }
      p.cb({ action: Actions.PLAYER_CARD_UP, card: card })
      game.tableUpdate({ action: Actions.PLAYER_CARD_UP, card: card, player: p })
    })
  }
}

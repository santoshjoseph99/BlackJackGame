module.exports = class PayoutStrategy {
  getPayout (bet, blackjack) {
    return blackjack ? Math.ceil((bet * 3) / 2) : bet
  }
}

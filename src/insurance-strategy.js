module.exports = class InsuranceStrategy {
  valid (upCard, downCard) {
    return upCard.rank === 'a'
  }
  amount (bet) {
    return Math.ceil(bet / 2)
  }
  payout (bet) {
    return bet * 2
  }
}

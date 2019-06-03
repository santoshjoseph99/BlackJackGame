module.exports = class DoubleDownStrategy {
  valid (cards) {
    if (cards.length > 2) {
      return false
    }
    return true
  }
}

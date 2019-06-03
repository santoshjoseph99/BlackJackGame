
module.exports = class PlayerHandHelper {
  static isSplitActionAvailable (actions) {
    return actions.some(x => x === actions.SPLIT)
  }

  static isDoubleDownActionAvailable (actions) {
    return actions.some(x => x === actions.DOUBLE_DOWN)
  }

  static shouldNotHit (values) {

  }
}

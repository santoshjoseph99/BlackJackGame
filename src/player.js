const actions = require('./actions');

module.exports = class Player {
  constructor({name, money}) {
    this.pos = -1;
    this.money = money;
    this.name = name;
  }
  set position(pos) {
    this.pos = pos;
  }
  get position() {
    return this.pos;
  }
  getInfo() {
    return {
      position: this.position,
      name: this.name,
      money: this.money,
      cardHistory: [],
      cards: '',
    };
  }
  tableAction(data) {
    switch(data.action) {
      case actions.START_GAME:
      break;
      case actions.END_GAME:
      break;
      case actions.START_HAND:
      break;
      case actions.END_HAND:
      break;
      default:
        throw new Error('Could not handle action', data.action.toString());
    }
  }
  playerAction(game, playerData) {

  }
}
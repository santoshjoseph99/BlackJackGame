const Player = require('../../lib/player').default;
const actions = require('../../lib/actions').default;
const {expect} = require('chai');

describe('Player', function () {
  describe('Position', function () {
    it('sets & gets', function() {
      const player = new Player('1', 0);
      expect(player.position).to.be.equal(-1);
      player.position = 1;
      expect(player.position).to.be.equal(1);
    })
  });
  describe('Info', function() {

  });
  describe('Table Actions', function () {
    it('handles start game', function () {
      const player = new Player('1', 0);
      player.tableAction({action: actions.startGame});
      expect(true);
    });
    it('handles end game', function() {
      const player = new Player('1', 0);
      player.tableAction({action: actions.endGame});
      expect(true);
    });
    it('handles start hand', function (){
      const player = new Player('1', 0);
      player.tableAction({action: actions.startHand});
      expect(true);
    });
    it('handles end hand', function (){
      const player = new Player('1', 0);
      player.tableAction({action: actions.endHand});
      expect(true);
    });
    it('handles card down', function () {
      const player = new Player('1', 0);
      player.tableAction({action: actions.playerCardDown});
      expect(true);
    })
  });
  describe('Player Actions', function () {

  });
});
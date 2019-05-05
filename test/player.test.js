const Player = require('../src/player');
const actions = require('../src/actions');

var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
chai.use(require('chai-subset'));
chai.use(require('sinon-chai'));

describe('Player', function () {
  describe('Creation', function () {
    it('object', function() {
      const player = new Player();
      expect(player).to.be.not.undefined;
    });
  });
  describe('Position', function () {
    it('sets & gets', function() {
      const player = new Player();
      expect(player.position).to.be.equal(-1);
      player.position = 1;
      expect(player.position).to.be.equal(1);
    })
  });
  describe('Info', function() {

  });
  describe('Table Actions', function () {
    it('handles start game', function () {
      const player = new Player();
      player.tableAction({action: actions.START_GAME});
      expect(true);
    });
    it('handles end game', function() {
      const player = new Player();
      player.tableAction({action: actions.END_GAME});
      expect(true);
    });
    it('handles start hand', function (){
      const player = new Player();
      player.tableAction({action: actions.START_HAND});
      expect(true);
    });
    it('handles end hand', function (){
      const player = new Player();
      player.tableAction({action: actions.END_HAND});
      expect(true);
    });
    it('handles card down', function () {
      const player = new Player();
      player.tableAction({action: actions.PLAYER_CARD_DOWN});
      expect(true);
    })
  });
  describe('Player Actions', function () {

  });
});
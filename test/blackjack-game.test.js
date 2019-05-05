
const BlackjackGame = require('../src/blackjack-game');

var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
chai.use(require('chai-subset'));
chai.use(require('sinon-chai'));

function createCards(str) {
  let cardRanks = str.split(',');
  return cardRanks.map(r => {return {rank: r}});
}

describe('Blackjack Game', function() {
  describe('creating game', function() {
    it('returns an object', function() {
      const bjgame = new BlackjackGame();
      expect(bjgame).to.be.not.undefined;
    });
  });
  xdescribe('playing game', function() {
    it('callback: start game', function() {
      const bjgame = new BlackjackGame();
      const callback = {
        startGame: sinon.stub(),
        startHand: sinon.stub()
      }
      bjgame.start(callback, []);
      expect(callback.startGame).to.be.called;
    });
    it('callback: start hand for each player', function() {
      const bjgame = new BlackjackGame();
      const callback = {
        startGame: sinon.stub(),
        startHand: sinon.stub()
      }
      let players =[{name: '1'}, {name: '2'}, {name: '3'}];
      bjgame.start(callback, players);
      expect(callback.startGame).to.be.called;
      expect(callback.startHand).to.be.called;
    });
  });
  describe('hands', function() {
    describe('has no aces', function () {
      it('returns 1 value', function () {
        const bjgame = new BlackjackGame();
        let result = bjgame.getHandValues(createCards('3,2'));
        expect(result[0]).to.equal(5);
      });
      it('returns 1 value', function () {
        const bjgame = new BlackjackGame();
        let result = bjgame.getHandValues(createCards('j,q,k,t'));
        expect(result[0]).to.equal(40);
      });
      it('returns 1 value', function () {
        const bjgame = new BlackjackGame();
        let result = bjgame.getHandValues(createCards('j,q,7,9'));
        expect(result[0]).to.equal(36);
      });
    });
    describe('has aces', function() {
      it('returns 2 values', function() {
        const bjgame = new BlackjackGame();
        let result = bjgame.getHandValues(createCards('a,3'));
        expect(result[0]).to.equal(4);
        expect(result[1]).to.equal(14);
      });
      it('returns 3 values', function() {
        const bjgame = new BlackjackGame();
        let result = bjgame.getHandValues(createCards('a,3,a'));
        expect(result[0]).to.equal(5);
        expect(result[1]).to.equal(15);
        expect(result[2]).to.equal(25);
      });
      it('returns 4 values', function() {
        const bjgame = new BlackjackGame();
        let result = bjgame.getHandValues(createCards('a,3,a,a'));
        expect(result[0]).to.equal(6);
        expect(result[1]).to.equal(16);
        expect(result[2]).to.equal(26);
        expect(result[3]).to.equal(36);
      });
    })
  });
});
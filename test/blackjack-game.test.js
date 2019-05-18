
const BlackjackGame = require('../src/blackjack-game');
const Player = require('../src/player');
const actions = require('../src/actions');
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
  describe('adding players', function() {
    it('invalid position number', function(){

    });
    it('player already at that position', function(){

    })
    it('player already exists on the table', function(){

    })
    it('adding multiple players', function(){

    })
  })
  describe('playing game with no players', function() {
    it('should not play', function() {
      const SUT = new BlackjackGame();
      const result = SUT.start();
      expect(result).to.be.false;
    });
  })
  describe('step1', function() {
    it('completes the step', function () {
      const SUT = new BlackjackGame();
      const p1 = new Player({name: '', money: 0});
      SUT.addPlayer(p1, 1);
      const playerActionValues = [];
      const tableActionValues = [];
      function playerAction(game, data) {
        playerActionValues.push(data.action);
      }
      function tableActions(data) {
        tableActionValues.push(data.action);
      }
      SUT.subscribePlayerActions(p1, playerAction)
      SUT.subscribeTableActions(tableActions)
      SUT.step1();
      expect(tableActionValues[0]).to.be.equal(actions.START_GAME)
      expect(tableActionValues[1]).to.be.equal(actions.SHUFFLE)
      expect(tableActionValues[2]).to.be.equal(actions.SET_END_CARD)
      expect(tableActionValues[3]).to.be.equal(actions.BURN_CARD_UP)
      expect(playerActionValues).to.be.lengthOf(0);
    })
  })
  describe('step2', function() {
    it('completes the step', function () {
      const SUT = new BlackjackGame();
      const p1 = new Player({name: '', money: 0});
      SUT.addPlayer(p1, 1);
      const playerActionValues = [];
      const tableActionValues = [];
      function playerAction(game, data) {
        playerActionValues.push(data.action);
        if(data.action === actions.START_HAND){
          return 15;
        }
        return;
      }
      function tableActions(data) {
        tableActionValues.push(data.action);
      }
      SUT.subscribePlayerActions(p1, playerAction)
      SUT.subscribeTableActions(tableActions)
      SUT.step2();
      expect(tableActionValues[0]).to.be.equal(actions.PLAYER_BET_AMOUNT)
      expect(playerActionValues[0]).to.be.equal(actions.START_HAND);
    })
  })
  describe('step3', function() {
    it('completes the step', function () {
      const SUT = new BlackjackGame();
      const p1 = new Player({name: '', money: 0});
      SUT.addPlayer(p1, 1);
      const playerActionValues = [];
      const tableActionValues = [];
      function playerAction(game, data) {
        playerActionValues.push(data.action);
        if(data.action === actions.START_HAND){
          return 15;
        }
        return;
      }
      function tableActions(data) {
        tableActionValues.push(data.action);
      }
      SUT.subscribePlayerActions(p1, playerAction)
      SUT.subscribeTableActions(tableActions)
      SUT.step2();
      expect(tableActionValues[0]).to.be.equal(actions.PLAYER_BET_AMOUNT)
      expect(playerActionValues[0]).to.be.equal(actions.START_HAND);
    })
  })
  describe('playing game with 1 player', function() {
    it('should play game', function () {
      const SUT = new BlackjackGame();
      const p1 = new Player();
      SUT.addPlayer(p1, 1);
      sinon.stub(player.playerAction);
      sinon.stub(player.tableActions);
      SUT.subscribePlayerActions(player, p1.playerAction)
      SUT.subscribeTableActions(player.tableActions)
      const result = SUT.start();
      expect(result).to.be.true;
    })
  })
  describe('playing game with multiple players', function() {

  })
  describe('playing game with 1 valid and multiple non valid players', function() {

  })
  /*
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
  */
});
const BlackjackGame = require('../../lib/blackjack-game').default;
const Player = require('../../lib/player').default;
const actions = require('../../lib/actions').default;
var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
chai.use(require('chai-subset'));
chai.use(require('sinon-chai'));

describe('Blackjack Game', function() {
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
  describe('1 player', () => {
    
  describe.only('player stands, dealer stands', () => {
    const playerActionValues = [];
    const tableActionValues = [];
    const SUT = new BlackjackGame();
    const p1 = new Player({name: '', money: 0});
    p1.sittingOut = false;
    function playerAction(data) {
      playerActionValues.push(data.action);
      if(data.action === actions.startHand) {
        return {};
      } else if(data.action === actions.playerCardUp) {
        p1.cards.push(data.card);
      } else if(data.action === actions.playHand) {
        if(data.availableActions.find(x => x === actions.hit)) {
          return {action: actions.hit}
        }
      }
    }
    function tableActions(data) {
      // console.log(data.action)
      tableActionValues.push(data.action);
    }
    SUT.addPlayer(p1, 1);
    SUT.subscribePlayerActions(p1, playerAction)
    SUT.subscribeTableActions(tableActions)
    SUT.setCards([]);
    it('step1', function () {
      SUT.step1();
      expect(tableActionValues[0]).to.be.equal(actions.startGame)
      expect(tableActionValues[1]).to.be.equal(actions.shuffle)
      expect(tableActionValues[2]).to.be.equal(actions.setEndCard)
      expect(tableActionValues[3]).to.be.equal(actions.burnCardUp)
      expect(playerActionValues).to.be.lengthOf(0);
    });
    it('step2', function () {
      SUT.step2();
      expect(tableActionValues[4]).to.be.equal(actions.playerBetAmount);
      expect(playerActionValues[0]).to.be.equal(actions.startHand);
    });
    it('step3', () => {
      SUT.step3();
      expect(tableActionValues[5]).to.be.equal(actions.dealerCardDown);
      expect(tableActionValues[6]).to.be.equal(actions.playerCardUp);
      expect(tableActionValues[7]).to.be.equal(actions.dealerCardDown);
      expect(tableActionValues[8]).to.be.equal(actions.playerCardUp);
      expect(tableActionValues[9]).to.be.equal(actions.exposeDealerCard);

      expect(playerActionValues[1]).to.be.equal(actions.playerCardUp);
      expect(playerActionValues[2]).to.be.equal(actions.playerCardUp);
    });
    it('step4', () => {
      SUT.step4();
    });
    it('step5', () => {
      SUT.step5();
    });
  });
  describe('dealer blackjack', () => {

  });
  describe('player blackjack', () => {

  });
  describe('player and dealer blackjack', () => {

  });
  describe('player and dealer push', () => {

  });
  describe('player busts', () => {

  });
  describe('dealer busts', () => {

  });
  })
});
const SixDeckStrategy = require('../../lib/sixdeck-strategy').default;
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
chai.use(require('chai-subset'));
chai.use(require('sinon-chai'));

describe('Six Deck Strategy', () => {
  it('creates the correct amount of cards', () => {
    const SUT = new SixDeckStrategy();
    expect(SUT.deck.cards).to.be.lengthOf(312);
  });
  it('has the correct number of decks', () => {
    const SUT = new SixDeckStrategy();
    expect(SUT.getNumOfDecks()).to.be.equal(6);
  });
  it('returns null if setEndIdx is not called', () => {
    const SUT = new SixDeckStrategy();
    expect(SUT.getCard()).to.be.undefined;
  });
  it('returns cards up to setEndIdx', () => {
    const SUT = new SixDeckStrategy();
    SUT.setEndIdx(10);
    for(let i = 0; i < 10; i++) {
      expect(SUT.getCard()).to.exist;
    }
    expect(SUT.getCard()).to.be.undefined;
  });
  it('shuffles the deck', () => {
    const SUT = new SixDeckStrategy();
    SUT.setEndIdx(5);
    const cardAtIdx0 = SUT.getCard();
    const cardAtIdx1 = SUT.getCard();
    SUT.shuffleDeck();
    SUT.setEndIdx(5);
    const newCardAtIdx0 = SUT.getCard();
    const newCardAtIdx1 = SUT.getCard();
    expect(cardAtIdx0).to.not.equal(newCardAtIdx0);
    expect(cardAtIdx1).to.not.equal(newCardAtIdx1);
  });
});
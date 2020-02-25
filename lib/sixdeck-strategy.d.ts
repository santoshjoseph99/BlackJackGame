import { Card } from 'deckjs';
import IDeckStrategy from './interfaces/ideck-strategy';
export default class SixDeckStrategy implements IDeckStrategy {
    private numDecks;
    private deck;
    private index;
    private endIndex;
    constructor();
    setCards(cards: Card[]): void;
    getNumOfDecks(): number;
    shuffleDeck(): void;
    setEndIdx(i: number): void;
    dealFaceUp(): boolean;
    getCard(): Card | undefined;
}
//# sourceMappingURL=sixdeck-strategy.d.ts.map
import { Card } from 'deckjs';
export default interface IDeckStrategy {
    getNumOfDecks(): number;
    shuffleDeck(): void;
    setEndIdx(i: number): void;
    dealFaceUp(): boolean;
    getCard(): Card | undefined;
}
//# sourceMappingURL=ideck-strategy.d.ts.map
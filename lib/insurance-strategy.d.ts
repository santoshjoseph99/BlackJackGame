import { Card } from 'deckjs';
import IInsuranceStrategy from './interfaces/iinsurance-strategy';
export default class InsuranceStrategy implements IInsuranceStrategy {
    valid(upCard: Card, downCard: Card): boolean;
    amount(bet: number): number;
    payout(bet: number): number;
}
//# sourceMappingURL=insurance-strategy.d.ts.map
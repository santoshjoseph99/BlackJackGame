import IDealerStrategy from './interfaces/idealer-strategy';

export default class DealerStrategy implements IDealerStrategy {
  public dealCardsUp () : boolean {
    return true
  }
}

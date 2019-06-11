import IBetsStrategy from './interfaces/ibets-strategy';

export default class DefaultBetsStrategy implements IBetsStrategy {
  public getMin () : number {
    return 10
  }
  public getMax () : number {
    return 100
  }
}

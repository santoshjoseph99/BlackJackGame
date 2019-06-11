import ITableStrategy from "./interfaces/itable-strategy";

export default class TableStrategy implements ITableStrategy{
  public maxPlayers (): number {
    return 7
  }
  public getEndDeckIndex (): number {
    return 260
  }
}

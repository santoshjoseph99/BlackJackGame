
export default class IBlackjackGame {
  start ();
  addPlayer (player, position);
  subscribeTableActions (cb);
  subscribePlayerActions (player, cb);
}

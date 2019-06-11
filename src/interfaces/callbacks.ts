import IPlayerAction from "./iplayeraction";
import IPlayerResult from "./iplayerresult";
import ITableAction from "./itableaction";

export type PlayerActionCb = (data:IPlayerAction) => IPlayerResult;
export type TableActionCb = (data:ITableAction) => void;

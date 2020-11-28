import { singleton } from "tsyringe";

import { RummikubGameManager } from "./rummikubGame.manager";
import { RummikubSocketManager } from "./rummikubSocket.manager";

@singleton()
export class RummikubManager {
  constructor(
    readonly game: RummikubGameManager,
    readonly socket: RummikubSocketManager
  ) { }
}

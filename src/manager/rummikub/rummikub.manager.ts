import { singleton } from "tsyringe";
import { RummikubGameManager } from "./rummikubGame.manager";
import { RummikubPlayerManager } from "./rummikubPlayer.manager";

@singleton()
export class RummikubManager {
  constructor(
    readonly games: RummikubGameManager,
    readonly players: RummikubPlayerManager
  ) { }
}

import { singleton } from "tsyringe";
import { RummikubGameManager } from "./rummikubGame.manager";

@singleton()
export class RummikubManager {
  constructor(
    readonly games: RummikubGameManager
  ) { }
}

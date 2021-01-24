import { singleton } from "tsyringe";

import { SteamGameManager } from "./steamGame.manager";
import { SteamPlayerManager } from "./steamPlayer.manager";

@singleton()
export class SteamManager {
  constructor(
    readonly game: SteamGameManager,
    readonly player: SteamPlayerManager
  ) { }
}

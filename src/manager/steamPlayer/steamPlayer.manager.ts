import { SteamService } from "../../service/steam";
import { DatabaseService } from "../../service/database";
import { HttpError } from "../../util/HttpError";
import { SteamGameManager } from "../steamGame";
import { singleton } from "tsyringe";

@singleton()
export class SteamPlayerManager {
  constructor(
    private db: DatabaseService,
    private steamGameManager: SteamGameManager,
    private steamService: SteamService
  ) { }

  async get(steamId64: string) {
    const player = await this.steamService.getPlayerSummary(steamId64);
    if (!player) {
      throw HttpError.notFound(`steam player id=${steamId64}`);
    }
    const ownedGameIds = await this.steamService.getPlayerOwnedGameIds(steamId64);
    const ownedGames = await this.steamGameManager.getMany(ownedGameIds);
    return {
      player,
      ownedGames
    };
  }
}

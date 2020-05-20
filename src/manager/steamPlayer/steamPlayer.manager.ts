import { HttpError } from "@athenajs/core";
import * as _ from "lodash";
import { singleton } from "tsyringe";
import { SteamGame } from "../../model/SteamGame";
import { DatabaseService } from "../../service/database";
import { SteamPlayer, SteamService } from "../../service/steam";
import { SteamGameManager } from "../steamGame";

@singleton()
export class SteamPlayerManager {
  constructor(
    private db: DatabaseService,
    private steamGameManager: SteamGameManager,
    private steamService: SteamService
  ) { }

  async get(steamId64: string): Promise<{ player: SteamPlayer; ownedGames: SteamGame[] }> {
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

  async getMany(steamIds64: string[]): Promise<{ player: SteamPlayer; ownedGames: SteamGame[] }[]> {
    const players = _.compact(await Promise.all(steamIds64.map(async steamId64 => {
      const player = await this.steamService.getPlayerSummary(steamId64);
      if (!player) {
        return undefined;
      }
      return {
        player,
        ownedGameIds: await this.steamService.getPlayerOwnedGameIds(player.id)
      };
    })));
    if (players.some(p => p === undefined)) {
      throw HttpError.notFound("steam players");
    }
    const ownedGames = await this.steamGameManager.getMany(_.flatten(players.map(p => p.ownedGameIds)));
    return players.map(({ player, ownedGameIds }) => ({
      player,
      ownedGames: ownedGames.filter(g => ownedGameIds.includes(g._id))
    }));
  }
}

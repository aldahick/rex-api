import { HttpError } from "@athenajs/core";
import * as _ from "lodash";
import { singleton } from "tsyringe";
import { SteamGame } from "../../model/SteamGame";
import { SteamPlayer, SteamService } from "../../service/steam";
import { SteamGameManager } from "../steamGame";

export interface SteamPlayerWithGames {
  ownedGames?: SteamGame[];
  player: SteamPlayer;
}

@singleton()
export class SteamPlayerManager {
  constructor(
    private steamGameManager: SteamGameManager,
    private steamService: SteamService
  ) { }

  async get(steamId64: string): Promise<SteamPlayerWithGames> {
    const player = await this.steamService.getPlayerSummary(steamId64);
    if (!player) {
      throw HttpError.notFound(`steam player id=${steamId64}`);
    }
    const ownedGameIds = await this.steamService.getPlayerOwnedGameIds(steamId64);
    const ownedGames = ownedGameIds ? await this.steamGameManager.getMany(ownedGameIds) : [];
    return {
      player,
      ownedGames
    };
  }

  async getMany(steamIds64: string[]): Promise<SteamPlayerWithGames[]> {
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
    const ownedGames = await this.steamGameManager.getMany(_.flatten(players.map(p => p.ownedGameIds || [])));
    return players.map(({ player, ownedGameIds }) => ({
      player,
      ownedGames: ownedGameIds ? ownedGames.filter(g => ownedGameIds.includes(g._id)) : ownedGameIds
    }));
  }

  async resolveUsernames(identifiers: string[]): Promise<string[]> {
    return Promise.all(identifiers.map(async identifier => {
      const steamId = await this.steamService.getSteamId64FromUsername(identifier);
      return steamId || identifier;
    }));
  }
}

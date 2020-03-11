import { query } from "../service/registry";
import { IQuerySteamPlayerArgs, IQuery } from "../graphql/types";
import { SteamPlayerManager } from "../manager/steamPlayer";
import * as _ from "lodash";
import { singleton } from "tsyringe";

@singleton()
export class SteamPlayerResolver {
  constructor(
    private steamPlayerManager: SteamPlayerManager
  ) { }

  @query()
  async steamPlayer(root: void, { steamId64 }: IQuerySteamPlayerArgs): Promise<IQuery["steamPlayer"]> {
    const { player, ownedGames } = await this.steamPlayerManager.get(steamId64);
    return {
      ...player,
      _id: player.id,
      playingGame: player.playingGameId
        ? ownedGames.find(g => g._id === player.playingGameId)
        : undefined,
      ownedGames: _.sortBy(ownedGames, g => g.name)
    };
  }
}

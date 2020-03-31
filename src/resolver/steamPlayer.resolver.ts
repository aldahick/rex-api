import * as _ from "lodash";
import { singleton } from "tsyringe";
import { query } from "../service/registry";
import { IQuerySteamPlayerArgs, IQuery, IQuerySteamPlayersArgs } from "../graphql/types";
import { SteamPlayerManager } from "../manager/steamPlayer";
import { guard } from "../manager/auth";
import { SteamPlayer } from "../service/steam/SteamPlayer";
import { SteamGame } from "../model/SteamGame";

@singleton()
export class SteamPlayerResolver {
  constructor(
    private steamPlayerManager: SteamPlayerManager
  ) { }

  @guard(can => can.read("steamPlayer"))
  @query()
  async steamPlayer(root: void, { steamId64 }: IQuerySteamPlayerArgs): Promise<IQuery["steamPlayer"]> {
    const { player, ownedGames } = await this.steamPlayerManager.get(steamId64);
    return this.toGqlObject(player, ownedGames);
  }

  @guard(can => can.read("steamPlayer"))
  @query()
  async steamPlayers(root: void, { steamIds64 }: IQuerySteamPlayersArgs): Promise<IQuery["steamPlayers"]> {
    const players = await this.steamPlayerManager.getMany(steamIds64);
    return players.map(({ player, ownedGames }) => this.toGqlObject(player, ownedGames));
  }

  private toGqlObject(player: SteamPlayer, ownedGames: SteamGame[]) {
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

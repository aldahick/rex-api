import { guard, query } from "@athenajs/core";
import * as _ from "lodash";
import { singleton } from "tsyringe";
import { IQuery, IQuerySteamPlayerArgs, IQuerySteamPlayersArgs } from "../graphql/types";
import { SteamPlayerManager } from "../manager/steamPlayer";
import { SteamGame } from "../model/SteamGame";
import { SteamPlayer } from "../service/steam/SteamPlayer";

@singleton()
export class SteamPlayerResolver {
  constructor(
    private steamPlayerManager: SteamPlayerManager
  ) { }

  @guard({
    resource: "steamPlayer",
    action: "readAny"
  })
  @query()
  async steamPlayer(root: void, { steamId64 }: IQuerySteamPlayerArgs): Promise<IQuery["steamPlayer"]> {
    const { player, ownedGames = [] } = await this.steamPlayerManager.get(steamId64);
    return this.toGqlObject(player, ownedGames);
  }

  @guard({
    resource: "steamPlayer",
    action: "readAny"
  })
  @query()
  async steamPlayers(root: void, { steamIds64 }: IQuerySteamPlayersArgs): Promise<IQuery["steamPlayers"]> {
    const players = await this.steamPlayerManager.getMany(steamIds64);
    return players.map(({ player, ownedGames = [] }) => this.toGqlObject(player, ownedGames));
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

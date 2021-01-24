import { guard, mutation, query } from "@athenajs/core";
import * as _ from "lodash";
import { singleton } from "tsyringe";

import { IMutation, IQuery, IQuerySteamGamesArgs, IQuerySteamPlayerArgs, IQuerySteamPlayersArgs, ISteamPlayer } from "../graphql";
import { ProgressManager } from "../manager/progress";
import { SteamManager } from "../manager/steam";
import { SteamGame } from "../model/SteamGame";
import { SteamPlayer } from "../service/steam";

const SEARCH_PAGE_SIZE = 100;

@singleton()
export class SteamGameResolver {
  constructor(
    private readonly progressManager: ProgressManager,
    private readonly steamManager: SteamManager
  ) { }

  @guard({
    resource: "steamGame",
    action: "updateAny"
  })
  @mutation()
  async fetchSteamGames(): Promise<IMutation["fetchSteamGames"]> {
    const progress = await this.progressManager.create("fetchSteamGames");
    this.progressManager.resolveSafe(progress, this.steamManager.game.fetchAll(progress));
    return progress.toGqlObject();
  }

  @guard({
    resource: "steamGame",
    action: "readAny"
  })
  @query()
  async steamGames(root: unknown, { page, search }: IQuerySteamGamesArgs): Promise<IQuery["steamGames"]> {
    return this.steamManager.game.search(search, {
      offset: page * SEARCH_PAGE_SIZE,
      limit: SEARCH_PAGE_SIZE
    });
  }

  @guard({
    resource: "steamPlayer",
    action: "readAny"
  })
  @query()
  async steamPlayer(root: unknown, { steamId64 }: IQuerySteamPlayerArgs): Promise<IQuery["steamPlayer"]> {
    const { player, ownedGames = [] } = await this.steamManager.player.get(steamId64);
    return this.toGqlObject(player, ownedGames);
  }

  @guard({
    resource: "steamPlayer",
    action: "readAny"
  })
  @query()
  async steamPlayers(root: unknown, { steamIds64 }: IQuerySteamPlayersArgs): Promise<IQuery["steamPlayers"]> {
    const players = await this.steamManager.player.getMany(steamIds64);
    return players.map(({ player, ownedGames = [] }) => this.toGqlObject(player, ownedGames));
  }

  private toGqlObject(player: SteamPlayer, ownedGames: SteamGame[]): ISteamPlayer {
    return {
      ...player,
      _id: player.id,
      playingGame: player.playingGameId !== undefined
        ? ownedGames.find(g => g._id === player.playingGameId)
        : undefined,
      ownedGames: _.sortBy(ownedGames, g => g.name)
    };
  }
}

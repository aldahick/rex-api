import { guard, mutation, query } from "@athenajs/core";
import * as _ from "lodash";
import { singleton } from "tsyringe";

import { IMutation, IQuery, IQuerySteamGamesArgs, IQuerySteamPlayerArgs, IQuerySteamPlayersArgs, ISteamPlayer } from "../../graphql";
import { SteamPlayer } from "../../service/steam";
import { ProgressManager } from "../progress";
import { SteamGame } from "./model";
import { SteamGameManager } from "./steamGame.manager";
import { SteamPlayerManager } from "./steamPlayer.manager";

const SEARCH_PAGE_SIZE = 100;

@singleton()
export class SteamResolver {
  constructor(
    private readonly progressManager: ProgressManager,
    private readonly steamGameManager: SteamGameManager,
    private readonly steamPlayerManager: SteamPlayerManager
  ) { }

  @guard({
    resource: "steamGame",
    action: "updateAny"
  })
  @mutation()
  async fetchSteamGames(): Promise<IMutation["fetchSteamGames"]> {
    const progress = await this.progressManager.create("fetchSteamGames");
    this.progressManager.resolveSafe(progress, this.steamGameManager.fetchAll(progress));
    return progress.toGqlObject();
  }

  @guard({
    resource: "steamGame",
    action: "readAny"
  })
  @query()
  async steamGames(root: unknown, { page, search }: IQuerySteamGamesArgs): Promise<IQuery["steamGames"]> {
    return this.steamGameManager.search(search, {
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
    const { player, ownedGames = [] } = await this.steamPlayerManager.get(steamId64);
    return this.toGqlObject(player, ownedGames);
  }

  @guard({
    resource: "steamPlayer",
    action: "readAny"
  })
  @query()
  async steamPlayers(root: unknown, { steamIds64 }: IQuerySteamPlayersArgs): Promise<IQuery["steamPlayers"]> {
    const players = await this.steamPlayerManager.getMany(steamIds64);
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

import { guard, mutation, query } from "@athenajs/core";
import { singleton } from "tsyringe";
import { IMutation, IQuery, IQuerySteamGamesArgs } from "../graphql/types";
import { ProgressManager } from "../manager/progress";
import { SteamGameManager } from "../manager/steamGame";

const SEARCH_PAGE_SIZE = 100;

@singleton()
export class SteamGameResolver {
  constructor(
    private progressManager: ProgressManager,
    private steamGameManager: SteamGameManager
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
  async steamGames(root: void, { page, search }: IQuerySteamGamesArgs): Promise<IQuery["steamGames"]> {
    return this.steamGameManager.search(search, {
      offset: page * SEARCH_PAGE_SIZE,
      limit: SEARCH_PAGE_SIZE
    });
  }
}

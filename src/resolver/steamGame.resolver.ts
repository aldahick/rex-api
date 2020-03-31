import { singleton } from "tsyringe";
import { mutation, query } from "../service/registry";
import { SteamGameManager } from "../manager/steamGame";
import { IMutation, IQuery, IQuerySteamGamesArgs } from "../graphql/types";
import { ProgressManager } from "../manager/progress";
import { guard } from "../manager/auth";

const SEARCH_PAGE_SIZE = 100;

@singleton()
export class SteamGameResolver {
  constructor(
    private progressManager: ProgressManager,
    private steamGameManager: SteamGameManager
  ) { }

  @guard(can => can.create("steamGame"))
  @mutation()
  async fetchSteamGames(): Promise<IMutation["fetchSteamGames"]> {
    const progress = await this.progressManager.create("fetchSteamGames");
    this.progressManager.resolveSafe(progress, this.steamGameManager.fetchAll(progress));
    return progress.toGqlObject();
  }

  @guard(can => can.read("steamGame"))
  @query()
  async steamGames(root: void, { page, search }: IQuerySteamGamesArgs): Promise<IQuery["steamGames"]> {
    return this.steamGameManager.search(search, {
      offset: page * SEARCH_PAGE_SIZE,
      limit: SEARCH_PAGE_SIZE
    });
  }
}

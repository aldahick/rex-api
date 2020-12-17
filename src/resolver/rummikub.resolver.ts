import { guard, mutation, query } from "@athenajs/core";
import { singleton } from "tsyringe";

import { IMutation, IMutationCreateRummikubGameArgs, IQuery } from "../graphql";
import { RummikubManager } from "../manager/rummikub";

@singleton()
export class RummikubResolver {
  constructor(
    private readonly rummikubManager: RummikubManager
  ) { }

  @guard({
    resource: "rummikubGame",
    action: "createAny"
  })
  @mutation()
  async createRummikubGame(root: unknown, { name, privacy }: IMutationCreateRummikubGameArgs): Promise<IMutation["createRummikubGame"]> {
    const game = await this.rummikubManager.game.create(privacy, name);
    return game.toGqlObject();
  }

  @query()
  async rummikubGames(): Promise<IQuery["rummikubGames"]> {
    const games = await this.rummikubManager.game.getJoinable();
    return games.map(g => g.toGqlObject());
  }
}

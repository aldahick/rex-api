import { guard, HttpError,mutation, query, resolver } from "@athenajs/core";
import { singleton } from "tsyringe";
import { IMutation, IMutationCreateRummikubGameArgs, IMutationJoinRummikubGameArgs, IQuery, IRummikubPlayer } from "../graphql/types";
import { AuthContext } from "../manager/auth";
import { RummikubManager } from "../manager/rummikub";
import { RummikubPlayer } from "../model/RummikubGame";

@singleton()
export class RummikubResolver {
  constructor(
    private rummikubManager: RummikubManager
  ) { }

  @guard({
    resource: "rummikubGame",
    action: "createAny"
  })
  @mutation()
  async createRummikubGame(root: void, { name }: IMutationCreateRummikubGameArgs, context: AuthContext): Promise<IMutation["createRummikubGame"]> {
    const user = await context.user();
    return this.rummikubManager.games.create(user!, name);
  }

  @mutation()
  async joinRummikubGame(root: void, { id }: IMutationJoinRummikubGameArgs, context: AuthContext): Promise<IMutation["joinRummikubGame"]> {
    const user = await context.user();
    const game = await this.rummikubManager.games.get(id);
    if (!user) {
      throw HttpError.badRequest("Missing player name");
    }
    await this.rummikubManager.games.join(game, user!);
    return true;
  }

  @query()
  async rummikubGames(): Promise<IQuery["rummikubGames"]> {
    return this.rummikubManager.games.getJoinable();
  }

  @resolver("RummikubPlayer.user")
  async playerUser(root: RummikubPlayer): Promise<IRummikubPlayer["user"]> {
    return this.rummikubManager.players.getUser(root);
  }
}

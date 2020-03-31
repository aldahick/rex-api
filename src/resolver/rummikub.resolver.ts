import { singleton } from "tsyringe";
import { mutation, query } from "../service/registry";
import { IMutationJoinRummikubGameArgs, IMutation, IMutationCreateRummikubGameArgs, IQuery } from "../graphql/types";
import { RummikubManager } from "../manager/rummikub/rummikub.manager";
import { guard } from "../manager/auth/guard";
import { AuthContext } from "../manager/auth";
import { HttpError } from "../util/HttpError";

@singleton()
export class RummikubResolver {
  constructor(
    private rummikubManager: RummikubManager
  ) { }

  @guard(can => can.create("rummikubGame"))
  @mutation()
  async createRummikubGame(root: void, { name }: IMutationCreateRummikubGameArgs, context: AuthContext): Promise<IMutation["createRummikubGame"]> {
    const user = await context.user();
    return this.rummikubManager.games.create(user!, name);
  }

  @mutation()
  async joinRummikubGame(root: void, { id, playerName }: IMutationJoinRummikubGameArgs, context: AuthContext): Promise<IMutation["joinRummikubGame"]> {
    const user = await context.user();
    const game = await this.rummikubManager.games.get(id);
    if (!user && !playerName) {
      throw HttpError.badRequest("Missing player name");
    }
    await this.rummikubManager.games.join(game, user ?? { playerName: playerName! });
    return true;
  }

  @query()
  async rummikubGames(): Promise<IQuery["rummikubGames"]> {
    return this.rummikubManager.games.getJoinable();
  }
}

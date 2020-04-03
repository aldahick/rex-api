import { singleton } from "tsyringe";
import { websocketEvent, WebsocketPayload } from "../service/registry";
import { IRummikubJoinPayload, IRummikubUpdatePayload } from "../graphql/types";
import { guard } from "../manager/auth";
import { RummikubManager } from "../manager/rummikub";
import { HttpError } from "../util/HttpError";
import { RummikubGame, RummikubPlayer } from "../model/RummikubGame";

@singleton()
export class RummikubWebsocketHandler {
  constructor(
    private rummikubManager: RummikubManager
  ) { }

  @guard()
  @websocketEvent("rummikub.join")
  async join({ data: { gameId }, context }: WebsocketPayload<IRummikubJoinPayload>): Promise<boolean> {
    const user = await context.user();
    if (!user) {
      throw HttpError.internalError("missing user");
    }
    const game = await this.rummikubManager.games.get(gameId);
    await this.rummikubManager.games.join(game, user);
    // TODO system for emitting update to all players in game
    // socket.emit("rummikub.update")
    return true;
  }

  private async buildUpdate(game: RummikubGame, player: RummikubPlayer): Promise<IRummikubUpdatePayload> {
    return {
      board: game.board,
      players: game.players.map(p => ({
        ...p,
        hand: p._id === player._id ? p.hand : []
      }))
    };
  }
}

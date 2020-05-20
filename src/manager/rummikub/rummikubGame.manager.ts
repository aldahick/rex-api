import { HttpError } from "@athenajs/core";
import { singleton } from "tsyringe";
import { IRummikubGamePrivacy,IRummikubGameStatus } from "../../graphql/types";
import { RummikubGame, RummikubPlayer } from "../../model/RummikubGame";
import { User } from "../../model/User";
import { DatabaseService } from "../../service/database";

@singleton()
export class RummikubGameManager {
  constructor(
    private db: DatabaseService
  ) { }

  async get(id: string): Promise<RummikubGame> {
    const game = await this.db.rummikubGames.findById(id);
    if (!game) {
      throw HttpError.notFound(`rummikub game id="${id}" not found`);
    }
    return game;
  }

  getJoinable(): Promise<RummikubGame[]> {
    return this.db.rummikubGames.find({
      status: IRummikubGameStatus.Lobby,
      privacy: IRummikubGamePrivacy.Public
    }).exec();
  }

  create(user: User, name: string): Promise<RummikubGame> {
    return this.db.rummikubGames.create(new RummikubGame({
      name,
      status: IRummikubGameStatus.Lobby,
      // TODO remove hardcoded
      privacy: IRummikubGamePrivacy.Public,
      players: [
        new RummikubPlayer({
          name: user.username || user.email,
          userId: user._id,
          hand: []
        })
      ],
      chatMessages: [],
      board: []
    }));
  }

  async join(game: RummikubGame, user: User): Promise<RummikubPlayer> {
    if (game.status !== IRummikubGameStatus.Lobby) {
      throw HttpError.conflict("You can only join a game while it hasn't yet started");
    }
    if (game.players.find(p => p.userId === user._id)) {
      throw HttpError.conflict("You're already in this game on another session");
    }
    const player = new RummikubPlayer({
      name: user.username || user.email,
      userId: user._id,
      hand: []
    });
    await this.db.rummikubGames.updateOne({
      _id: game._id
    }, {
      $push: {
        players: player
      }
    });
    return player;
  }
}

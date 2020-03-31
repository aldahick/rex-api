import * as randomstring from "randomstring";
import { singleton } from "tsyringe";
import { RummikubGame, RummikubPlayer } from "../../model/RummikubGame";
import { DatabaseService } from "../../service/database";
import { IRummikubGameStatus, IRummikubGamePrivacy } from "../../graphql/types";
import { User } from "../../model/User";
import { HttpError } from "../../util/HttpError";

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
      chatMessages: []
    }));
  }

  async join(game: RummikubGame, userOrPlayer: { playerName: string } | User): Promise<void> {
    if (game.status !== IRummikubGameStatus.Lobby) {
      throw HttpError.conflict("You can only join a game while it hasn't yet started");
    }
    let player: RummikubPlayer;
    if ("playerName" in userOrPlayer) {
      const existingPlayer = game.players.find(p => p.name.toLowerCase() === userOrPlayer.playerName);
      if (existingPlayer) {
        throw HttpError.conflict("Someone already has that name");
      }
      player = new RummikubPlayer({
        name: userOrPlayer.playerName,
        hand: []
      });
    } else {
      if (game.players.find(p => p.userId === userOrPlayer._id)) {
        throw HttpError.conflict("You're already in this game on another session");
      }
      player = new RummikubPlayer({
        name: userOrPlayer.username || userOrPlayer.email,
        userId: userOrPlayer._id,
        hand: []
      });
    }
    player._id = randomstring.generate();
    await this.db.rummikubGames.updateOne({
      _id: game._id
    }, {
      $push: {
        players: player
      }
    });
  }
}

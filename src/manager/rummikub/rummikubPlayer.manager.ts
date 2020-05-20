import { HttpError } from "@athenajs/core";
import { singleton } from "tsyringe";
import { RummikubPlayer } from "../../model/RummikubGame";
import { User } from "../../model/User";
import { DatabaseService } from "../../service/database";

@singleton()
export class RummikubPlayerManager {
  constructor(
    private db: DatabaseService
  ) { }

  async getUser(player: RummikubPlayer): Promise<User> {
    const user = await this.db.users.findById(player._id);
    if (!user) {
      throw HttpError.notFound(`rummikub player's user, user id="${player.userId}", player id="${player._id}"`);
    }
    return user;
  }
}

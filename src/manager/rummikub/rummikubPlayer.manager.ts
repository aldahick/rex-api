import { singleton } from "tsyringe";
import { DatabaseService } from "../../service/database";
import { RummikubPlayer } from "../../model/RummikubGame";
import { User } from "../../model/User";
import { HttpError } from "../../util/HttpError";

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

import { singleton } from "tsyringe";
import { Role } from "../../model/Role";
import { User } from "../../model/User";
import { DatabaseService } from "../../service/database";
import { HttpError } from "../../util/HttpError";
import { AuthManager } from "../auth";

@singleton()
export class UserManager {
  constructor(
    private authManager: AuthManager,
    private db: DatabaseService
  ) { }

  async get(id: string): Promise<User> {
    const user = await this.getSafe(id);
    if (!user) {
      throw HttpError.notFound(`user id=${id} not found`);
    }
    return user;
  }

  async getSafe(id: string): Promise<User | undefined> {
    const user = await this.db.users.findById(id);
    return user?.toObject() || undefined;
  }

  async getRoles(user: User): Promise<Role[]> {
    return this.db.roles.find({
      _id: { $in: user.roleIds }
    });
  }

  async setPassword(user: User, password: string): Promise<void> {
    const hash = await this.authManager.hashPassword(password);
    await this.db.users.updateOne({
      _id: user._id
    }, {
      $set: {
        "auth.passwordHash": hash
      }
    });
  }
}

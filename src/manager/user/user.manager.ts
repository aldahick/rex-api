import { HttpError } from "@athenajs/core";
import { singleton } from "tsyringe";
import { Role } from "../../model/Role";
import { User } from "../../model/User";
import { DatabaseService } from "../../service/database";
import { UserCalendarManager } from "./userCalendar.manager";
import { UserPasswordManager } from "./userPassword.manager";

@singleton()
export class UserManager {
  constructor(
    readonly calendar: UserCalendarManager,
    readonly password: UserPasswordManager,
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
}

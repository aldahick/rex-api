import * as _ from "lodash";
import { singleton } from "tsyringe";
import { User } from "../../model/User";
import { DatabaseService } from "../../service/database";
import { HttpError } from "../../util/HttpError";
import { RolePermission } from "../../model/Role/RolePermission";
import { Role } from "../../model/Role";

@singleton()
export class UserManager {
  constructor(
    private db: DatabaseService
  ) { }

  async get(id: string): Promise<User> {
    const user = await this.db.users.findById(id);
    if (!user) {
      throw HttpError.notFound(`user id=${id} not found`);
    }
    return user;
  }

  async getRoles(user: User): Promise<Role[]> {
    return this.db.roles.find({
      _id: { $in: user.roleIds }
    });
  }

  async getPermissions(user: User): Promise<RolePermission[]> {
    const roles = await this.getRoles(user);
    return _.flatten(roles.map(r => r.permissions));
  }
}

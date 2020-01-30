import { singleton } from "tsyringe";
import { Role } from "../../model/Role";
import { DatabaseService } from "../../service/database";
import { HttpError } from "../../util/HttpError";

@singleton()
export class RoleManager {
  constructor(
    private db: DatabaseService
  ) { }

  async get(id: string): Promise<Role> {
    const role = await this.db.roles.findById(id);
    if (!role) {
      throw HttpError.notFound(`role id=${id} not found`);
    }
    return role;
  }
}

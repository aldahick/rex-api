import * as _ from "lodash";
import { singleton } from "tsyringe";
import { DocumentType } from "@typegoose/typegoose";
import { Role } from "../../model/Role";
import { DatabaseService } from "../../service/database";
import { HttpError } from "../../util/HttpError";
import { RolePermission } from "../../model/Role/RolePermission";

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
    return role.toObject();
  }

  toPermissions(roles: Role[]): (RolePermission & { role: Role })[] {
    return _.flatten(roles.map(role =>
      (role.permissions as DocumentType<RolePermission>[]).map(permission => ({
        ...permission.toObject(),
        role
      }))
    ));
  }
}

import { query, mutation } from "../service/registry";
import { DatabaseService } from "../service/database";
import { IQuery, IMutationCreateRoleArgs, IMutation, IMutationAddPermissionsToRoleArgs } from "../graphql/types";
import { Role } from "../model/Role";
import { HttpError } from "../util/HttpError";
import { guard } from "../manager/auth/guard";
import { singleton } from "tsyringe";
import * as _ from "lodash";

@singleton()
export class RoleResolver {
  constructor(
    private db: DatabaseService
  ) { }

  @guard(can => can.read("role"))
  @query()
  async roles(): Promise<IQuery["roles"]> {
    return this.db.roles.find();
  }

  @guard(can => can.create("role"))
  @mutation()
  async createRole(root: void, { name }: IMutationCreateRoleArgs): Promise<IMutation["createRole"]> {
    return this.db.roles.create(new Role({
      name,
      permissions: []
    }));
  }

  @guard(can => can.update("role"))
  @mutation()
  async addPermissionsToRole(root: void, { roleId, permissions }: IMutationAddPermissionsToRoleArgs): Promise<IMutation["addPermissionsToRole"]> {
    const role = await this.db.roles.findById(roleId);
    if (!role) {
      throw HttpError.notFound(`role id=${roleId} does not exist`);
    }
    await this.db.roles.updateOne({ _id: role._id }, {
      $set: {
        permissions: _.uniqBy(
          role.permissions.concat(permissions),
          p => `${p.action}-${p.resource}`
        )
      }
    });
    return true;
  }
}

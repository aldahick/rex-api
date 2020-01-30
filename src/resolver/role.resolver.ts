import * as _ from "lodash";
import { singleton } from "tsyringe";
import { query, mutation } from "../service/registry";
import { DatabaseService } from "../service/database";
import { IQuery, IMutationCreateRoleArgs, IMutation, IMutationAddPermissionsToRoleArgs } from "../graphql/types";
import { Role } from "../model/Role";
import { HttpError } from "../util/HttpError";

@singleton()
export class RoleResolver {
  constructor(
    private db: DatabaseService
  ) { }

  @query()
  async roles(): Promise<IQuery["roles"]> {
    return this.db.roles.find();
  }

  @mutation()
  async createRole(root: void, { name }: IMutationCreateRoleArgs): Promise<IMutation["createRole"]> {
    return this.db.roles.create(new Role({
      name,
      permissions: []
    }));
  }

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

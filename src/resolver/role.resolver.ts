import * as _ from "lodash";
import { singleton } from "tsyringe";
import { guard, query, mutation, HttpError } from "@athenajs/core";
import { IQuery, IMutationCreateRoleArgs, IMutation, IMutationAddPermissionsToRoleArgs } from "../graphql/types";
import { Role } from "../model/Role";
import { DatabaseService } from "../service/database";

@singleton()
export class RoleResolver {
  constructor(
    private db: DatabaseService
  ) { }

  @guard({
    resource: "role",
    action: "readAny"
  })
  @query()
  async roles(): Promise<IQuery["roles"]> {
    return this.db.roles.find();
  }

  @guard({
    resource: "role",
    action: "createAny"
  })
  @mutation()
  async createRole(root: void, { name }: IMutationCreateRoleArgs): Promise<IMutation["createRole"]> {
    return this.db.roles.create(new Role({
      name,
      permissions: []
    }));
  }

  @guard({
    resource: "role",
    action: "updateAny",
    attributes: "permissions"
  })
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

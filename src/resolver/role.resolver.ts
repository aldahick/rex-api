import { guard, HttpError, mutation, query } from "@athenajs/core";
import * as _ from "lodash";
import { singleton } from "tsyringe";
import { IMutation, IMutationAddPermissionsToRoleArgs, IMutationCreateRoleArgs, IQuery } from "../graphql/types";
import { Role } from "../model/Role";
import { DatabaseService } from "../service/database";

@singleton()
export class RoleResolver {
  constructor(
    private readonly db: DatabaseService
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
  async createRole(root: unknown, { name }: IMutationCreateRoleArgs): Promise<IMutation["createRole"]> {
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
  async updateRolePermissions(root: unknown, { roleId, permissions }: IMutationAddPermissionsToRoleArgs): Promise<IMutation["addPermissionsToRole"]> {
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

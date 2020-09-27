import { guard, mutation, query } from "@athenajs/core";
import { singleton } from "tsyringe";
import { IMutation, IMutationCreateRoleArgs, IMutationDeleteRoleArgs, IMutationUpdateRoleArgs, IMutationUpdateRolePermissionsArgs, IQuery } from "../graphql/types";
import { RoleManager } from "../manager/role";

@singleton()
export class RoleResolver {
  constructor(
    private readonly roleManager: RoleManager
  ) { }

  @guard({
    resource: "role",
    action: "readAny"
  })
  @query()
  async roles(): Promise<IQuery["roles"]> {
    return this.roleManager.getAll();
  }

  @guard({
    resource: "role",
    action: "createAny"
  })
  @mutation()
  async createRole(root: unknown, { name }: IMutationCreateRoleArgs): Promise<IMutation["createRole"]> {
    return this.roleManager.create(name);
  }

  @guard({
    resource: "role",
    action: "deleteAny"
  })
  @mutation()
  async deleteRole(root: unknown, { id }: IMutationDeleteRoleArgs): Promise<IMutation["deleteRole"]> {
    const role = await this.roleManager.get(id);
    await this.roleManager.delete(role);
    return true;
  }

  @guard({
    resource: "role",
    action: "updateAny",
    attributes: "name"
  })
  @mutation()
  async updateRole(root: unknown, { id, name }: IMutationUpdateRoleArgs): Promise<IMutation["updateRole"]> {
    const role = await this.roleManager.get(id);
    await this.roleManager.update(role, { name });
    return true;
  }

  @guard({
    resource: "role",
    action: "updateAny",
    attributes: "permissions"
  })
  @mutation()
  async updateRolePermissions(root: unknown, { id, permissions }: IMutationUpdateRolePermissionsArgs): Promise<IMutation["updateRolePermissions"]> {
    const role = await this.roleManager.get(id);
    await this.roleManager.setPermissions(role, permissions);
    return true;
  }
}

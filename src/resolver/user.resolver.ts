import { guard, HttpError, mutation, query, resolver } from "@athenajs/core";
import { singleton } from "tsyringe";
import { IMutation, IMutationAddRoleToUserArgs, IMutationCreateUserArgs, IMutationSetUserPasswordArgs, IQuery, IQueryUserArgs, IUser } from "../graphql/types";
import { AuthContext } from "../manager/auth";
import { RoleManager } from "../manager/role";
import { UserManager } from "../manager/user";
import { User } from "../model/User";

@singleton()
export class UserResolver {
  constructor(
    private readonly roleManager: RoleManager,
    private readonly userManager: UserManager
  ) { }

  @query()
  async user(root: unknown, { id }: IQueryUserArgs, context: AuthContext): Promise<IQuery["user"]> {
    if (id !== undefined && await context.isAuthorized({
      resource: "user",
      action: "readAny"
    })) {
      return this.userManager.get(id);
    } else if (context.userId !== undefined && await context.isAuthorized({
      resource: "user",
      action: "readOwn"
    })) {
      return this.userManager.get(context.userId);
    } else {
      throw HttpError.forbidden();
    }
  }

  @guard({
    resource: "user",
    action: "readAny"
  })
  @query()
  async users(): Promise<IQuery["users"]> {
    return this.userManager.getAll();
  }

  @guard({
    resource: "role",
    action: "readAny"
  })
  @resolver("User.roles")
  async roles(root: User): Promise<IUser["roles"]> {
    return this.userManager.getRoles(root);
  }

  @guard({
    resource: "role",
    action: "readAny"
  })
  @resolver("User.permissions")
  async permissions(root: User): Promise<IUser["permissions"]> {
    const roles = await this.userManager.getRoles(root);
    return this.roleManager.toPermissions(roles);
  }

  @guard({
    resource: "user",
    action: "updateAny",
    attributes: "role"
  })
  @mutation()
  async addRoleToUser(root: unknown, { userId, roleId }: IMutationAddRoleToUserArgs): Promise<IMutation["addRoleToUser"]> {
    const user = await this.userManager.get(userId);
    const role = await this.roleManager.get(roleId);

    await this.userManager.addRole(user, role);

    return true;
  }

  @guard({
    resource: "user",
    action: "createAny"
  })
  @mutation()
  async createUser(root: unknown, { email, username, password }: IMutationCreateUserArgs): Promise<IMutation["createUser"]> {
    return this.userManager.create({ email, username, password });
  }

  @guard({
    resource: "user",
    action: "updateAny",
    attributes: "password"
  })
  @mutation()
  async setUserPassword(root: unknown, { userId, password }: IMutationSetUserPasswordArgs): Promise<IMutation["setUserPassword"]> {
    const user = await this.userManager.get(userId);
    await this.userManager.password.set(user, password);
    return true;
  }
}

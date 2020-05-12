import { singleton } from "tsyringe";
import { guard, query, HttpError, resolver, mutation } from "@athenajs/core";
import { IUser, IQuery, IQueryUserArgs, IMutation, IMutationAddRoleToUserArgs, IMutationCreateUserArgs, IMutationSetUserPasswordArgs } from "../graphql/types";
import { RoleManager } from "../manager/role";
import { UserManager } from "../manager/user";
import { User } from "../model/User";
import { DatabaseService } from "../service/database";

@singleton()
export class UserResolver {
  constructor(
    private db: DatabaseService,
    private roleManager: RoleManager,
    private userManager: UserManager
  ) { }

  @guard({
    resource: "user",
    action: "readAny"
  })
  @query()
  async user(root: void, { id }: IQueryUserArgs): Promise<IQuery["user"]> {
    const user = await this.db.users.findById(id);
    if (!user) {
      throw HttpError.notFound(`user id=${id} not found`);
    }
    return user;
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
  async addRoleToUser(root: void, { userId, roleId }: IMutationAddRoleToUserArgs): Promise<IMutation["addRoleToUser"]> {
    const user = await this.userManager.get(userId);
    const role = await this.roleManager.get(roleId);

    await this.db.users.updateOne({ _id: user._id }, {
      $addToSet: {
        roleIds: role._id
      }
    });

    return true;
  }

  @guard({
    resource: "user",
    action: "createAny"
  })
  @mutation()
  async createUser(root: void, { email, username, password }: IMutationCreateUserArgs): Promise<IMutation["createUser"]> {
    const existing = await this.db.users.findOne({
      $or: [
        { email },
        { username: email },
        ...(username ? [
          { username },
          { email: username }
        ] : [])
      ]
    });
    if (existing) {
      throw HttpError.conflict(`user email=${email} already exists`);
    }
    return this.db.users.create(new User({
      email,
      username,
      auth: {
        passwordHash: password ? await this.userManager.hashPassword(password) : undefined
      },
      roleIds: []
    }));
  }

  @guard({
    resource: "user",
    action: "updateAny",
    attributes: "password"
  })
  @mutation()
  async setUserPassword(root: void, { userId, password }: IMutationSetUserPasswordArgs): Promise<IMutation["setUserPassword"]> {
    const user = await this.userManager.get(userId);
    await this.userManager.setPassword(user, password);
    return true;
  }
}

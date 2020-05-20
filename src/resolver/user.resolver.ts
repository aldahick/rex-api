import { guard, HttpError, mutation,query, resolver } from "@athenajs/core";
import { singleton } from "tsyringe";
import { IMutation, IMutationAddRoleToUserArgs, IMutationCreateUserArgs, IMutationSetUserPasswordArgs,IQuery, IQueryUserArgs, IUser } from "../graphql/types";
import { AuthContext } from "../manager/auth";
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

  @query()
  async user(root: void, { id }: IQueryUserArgs, context: AuthContext): Promise<IQuery["user"]> {
    if (id && await context.isAuthorized({
      resource: "user",
      action: "readAny"
    })) {
      return this.userManager.get(id);
    } else if (context.userId && await context.isAuthorized({
      resource: "user",
      action: "readOwn"
    })) {
      return this.userManager.get(context.userId);
    } else {
      throw HttpError.forbidden();
    }
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
        passwordHash: password ? await this.userManager.password.hash(password) : undefined
      },
      roleIds: [],
      calendars: []
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
    await this.userManager.password.set(user, password);
    return true;
  }
}

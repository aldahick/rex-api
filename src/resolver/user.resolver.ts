import { singleton } from "tsyringe";
import { IUser, IQuery, IQueryUserArgs, IMutation, IMutationAddRoleToUserArgs, IMutationCreateUserArgs, IMutationSetUserPasswordArgs } from "../graphql/types";
import { RoleManager } from "../manager/role";
import { UserManager } from "../manager/user";
import { User } from "../model/User";
import { DatabaseService } from "../service/database";
import { resolver, query, mutation } from "../service/registry";
import { HttpError } from "../util/HttpError";
import { guard } from "../manager/auth";

@singleton()
export class UserResolver {
  constructor(
    private db: DatabaseService,
    private roleManager: RoleManager,
    private userManager: UserManager
  ) { }

  @guard(can => can.read("user"))
  @query()
  async user(root: void, { id }: IQueryUserArgs): Promise<IQuery["user"]> {
    const user = await this.db.users.findById(id);
    if (!user) {
      throw HttpError.notFound(`user id=${id} not found`);
    }
    return user;
  }

  @resolver("User.roles")
  async roles(root: User): Promise<IUser["roles"]> {
    return this.userManager.getRoles(root);
  }

  @resolver("User.permissions")
  async permissions(root: User): Promise<IUser["permissions"]> {
    const roles = await this.userManager.getRoles(root);
    return this.roleManager.toPermissions(roles);
  }

  @guard(can => can.update("user"))
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

  @guard(can => can.create("user"))
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

  @guard(can => can.update("user"))
  @mutation()
  async setUserPassword(root: void, { userId, password }: IMutationSetUserPasswordArgs): Promise<IMutation["setUserPassword"]> {
    const user = await this.userManager.get(userId);
    await this.userManager.setPassword(user, password);
    return true;
  }
}

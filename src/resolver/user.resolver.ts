import { singleton } from "tsyringe";
import { DatabaseService } from "../service/database";
import { resolver, query, mutation } from "../service/registry";
import { IUser, IQuery, IQueryUserArgs, IMutation, IMutationAddRoleToUserArgs, IMutationCreateUserArgs } from "../graphql/types";
import { User } from "../model/User";
import { HttpError } from "../util/HttpError";
import { UserManager } from "../manager/user";
import { RoleManager } from "../manager/role";

@singleton()
export class UserResolver {
  constructor(
    private db: DatabaseService,
    private roleManager: RoleManager,
    private userManager: UserManager
  ) { }

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
    return this.userManager.getPermissions(root);
  }

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

  @mutation()
  async createUser(root: void, { email }: IMutationCreateUserArgs): Promise<IMutation["createUser"]> {
    const existing = await this.db.users.findOne({ email });
    if (existing) {
      throw HttpError.conflict(`user email=${email} already exists`);
    }
    return this.db.users.create(new User({
      email,
      auth: {},
      roleIds: []
    }));
  }
}

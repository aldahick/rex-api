import { HttpError } from "@athenajs/core";
import { singleton } from "tsyringe";
import { Role } from "../../model/Role";
import { User } from "../../model/User";
import { DatabaseService } from "../../service/database";
import { UserCalendarManager } from "./userCalendar.manager";
import { UserNoteManager } from "./userNote.manager";
import { UserPasswordManager } from "./userPassword.manager";

@singleton()
export class UserManager {
  constructor(
    readonly calendar: UserCalendarManager,
    readonly note: UserNoteManager,
    readonly password: UserPasswordManager,
    private readonly db: DatabaseService
  ) { }

  async get(id: string): Promise<User> {
    const user = await this.getSafe(id);
    if (!user) {
      throw HttpError.notFound(`user id=${id} not found`);
    }
    return user;
  }

  async getSafe(id: string): Promise<User | undefined> {
    const user = await this.db.users.findById(id);
    return user?.toObject() as User | undefined ?? undefined;
  }

  async getAll(): Promise<User[]> {
    return this.db.users.find();
  }

  async addRole(user: User, role: Role): Promise<void> {
    await this.db.users.updateOne({ _id: user._id }, {
      $addToSet: {
        roleIds: role._id
      }
    });
  }

  async getRoles(user: User): Promise<Role[]> {
    return this.db.roles.find({
      _id: { $in: user.roleIds }
    });
  }

  async create({ email, username, password }: {
    email: string;
    username?: string;
    password?: string;
  }): Promise<User> {
    const existing = await this.db.users.findOne({
      $or: [
        { email },
        { username: email },
        ...username !== undefined && username.length > 0 ? [
          { username },
          { email: username }
        ] : []
      ]
    });
    if (existing) {
      throw HttpError.conflict(`user email=${email} already exists`);
    }
    return this.db.users.create(new User({
      email,
      username,
      auth: {
        passwordHash: password !== undefined && password.length > 0
          ? await this.password.hash(password)
          : undefined
      },
      roleIds: [],
      calendars: [],
      notes: []
    }));
  }
}

import * as bcrypt from "bcrypt";
import { singleton } from "tsyringe";

import { DatabaseService } from "../../service/database";
import { User } from "./model";

@singleton()
export class UserPasswordManager {
  constructor(
    private readonly db: DatabaseService
  ) { }

  async set(user: User, password: string): Promise<void> {
    const hash = await this.hash(password);
    await this.db.users.updateOne({
      _id: user._id
    }, {
      $set: {
        "auth.passwordHash": hash
      }
    });
  }

  hash(password: string): Promise<string> {
    return bcrypt.hash(password, 8);
  }

  isValid(raw: string, hash: string): Promise<boolean> {
    return bcrypt.compare(raw, hash);
  }
}

import { HttpError } from "@athenajs/core";
import * as _ from "lodash";
import { singleton } from "tsyringe";
import { Secret } from "../../model/Secret";
import { DatabaseService } from "../../service/database";

@singleton()
export class SecretManager {
  constructor(
    private readonly db: DatabaseService
  ) { }

  async getAll(prefix: string): Promise<Secret[]> {
    return this.db.secrets.find({
      key: {
        $regex: new RegExp(`^${_.escapeRegExp(prefix)}`)
      }
    });
  }

  async get(key: string): Promise<Secret> {
    const secret = await this.db.secrets.findOne({ key });
    if (!secret) {
      throw HttpError.notFound(`secret key=${key}`);
    }
    return secret;
  }

  async set(key: string, value: string): Promise<void> {
    const secret = await this.db.secrets.findOne({ key });
    if (secret) {
      await this.db.secrets.updateOne({ key }, { $set: { value } });
    } else {
      await this.db.secrets.create(new Secret({ key, value }));
    }
  }

  async remove(key: string): Promise<void> {
    await this.db.secrets.deleteOne({ key });
  }
}

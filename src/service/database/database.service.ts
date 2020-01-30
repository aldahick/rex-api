import { singleton } from "tsyringe";
import { Connection, createConnection } from "mongoose";
import { ReturnModelType, getModelForClass } from "@typegoose/typegoose";
import { AnyParamConstructor } from "@typegoose/typegoose/lib/types";
import { ConfigService } from "../config";
import { Role } from "../../model/Role";
import { User } from "../../model/User";

@singleton()
export class DatabaseService {
  roles!: ReturnModelType<typeof Role>;
  users!: ReturnModelType<typeof User>;

  constructor(
    private config: ConfigService
  ) { }

  private connection?: Connection;

  async init() {
    if (this.connection) {
      return;
    }
    this.connection = await createConnection(this.config.mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    this.roles = this.getModel(Role, "roles");
    this.users = this.getModel(User, "users");
  }

  async close() {
    await this.connection?.close();
  }

  private getModel<T extends AnyParamConstructor<any>>(model: T, collectionName: string) {
    return getModelForClass<any, T>(model, {
      existingConnection: this.connection,
      schemaOptions: { collection: collectionName }
    });
  }
}

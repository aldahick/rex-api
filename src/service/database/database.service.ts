import { ConfigService } from "../config";
import { Role } from "../../model/Role";
import { User } from "../../model/User";
import { Container } from "../../model/Container";
import { Host } from "../../model/Host";
import { AnyParamConstructor } from "@typegoose/typegoose/lib/types";
import { ReturnModelType, getModelForClass } from "@typegoose/typegoose";
import { Connection, createConnection } from "mongoose";
import { singleton } from "tsyringe";

@singleton()
export class DatabaseService {
  containers!: ReturnModelType<typeof Container>;
  hosts!: ReturnModelType<typeof Host>;
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

    this.containers = this.getModel(Container, "containers");
    this.hosts = this.getModel(Host, "hosts");
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

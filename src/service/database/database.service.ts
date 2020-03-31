import { ReturnModelType, getModelForClass } from "@typegoose/typegoose";
import { AnyParamConstructor } from "@typegoose/typegoose/lib/types";
import { Connection, createConnection } from "mongoose";
import { singleton } from "tsyringe";
import { ConfigService } from "../config";
import { Container } from "../../model/Container";
import { Host } from "../../model/Host";
import { Progress } from "../../model/Progress";
import { Role } from "../../model/Role";
import { RummikubGame } from "../../model/RummikubGame";
import { SteamGame } from "../../model/SteamGame";
import { User } from "../../model/User";
import { WikiPage } from "../../model/WikiPage";

@singleton()
export class DatabaseService {
  containers!: ReturnModelType<typeof Container>;
  hosts!: ReturnModelType<typeof Host>;
  progress!: ReturnModelType<typeof Progress>;
  roles!: ReturnModelType<typeof Role>;
  rummikubGames!: ReturnModelType<typeof RummikubGame>;
  steamGames!: ReturnModelType<typeof SteamGame>;
  users!: ReturnModelType<typeof User>;
  wikiPages!: ReturnModelType<typeof WikiPage>;

  constructor(
    private config: ConfigService
  ) { }

  private connection?: Connection;

  async init() {
    if (this.connection) {
      return;
    }
    this.connection = await createConnection(this.config.mongoUrl, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    this.containers = this.getModel(Container, "containers");
    this.hosts = this.getModel(Host, "hosts");
    this.progress = this.getModel(Progress, "progress");
    this.steamGames = this.getModel(SteamGame, "steamGames");
    this.roles = this.getModel(Role, "roles");
    this.rummikubGames = this.getModel(RummikubGame, "rummikubGames");
    this.users = this.getModel(User, "users");
    this.wikiPages = this.getModel(WikiPage, "wikiPages");
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

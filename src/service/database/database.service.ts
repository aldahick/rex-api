import { MongoService } from "@athenajs/core";
import { ReturnModelType } from "@typegoose/typegoose";
import { singleton } from "tsyringe";
import { Container } from "../../model/Container";
import { Host } from "../../model/Host";
import { Progress } from "../../model/Progress";
import { Role } from "../../model/Role";
import { RummikubGame } from "../../model/RummikubGame";
import { Secret } from "../../model/Secret";
import { SteamGame } from "../../model/SteamGame";
import { User } from "../../model/User";
import { WikiPage } from "../../model/WikiPage";
import { ConfigService } from "../config";

@singleton()
export class DatabaseService {
  containers!: ReturnModelType<typeof Container>;

  hosts!: ReturnModelType<typeof Host>;

  progress!: ReturnModelType<typeof Progress>;

  roles!: ReturnModelType<typeof Role>;

  rummikubGames!: ReturnModelType<typeof RummikubGame>;

  secrets!: ReturnModelType<typeof Secret>;

  steamGames!: ReturnModelType<typeof SteamGame>;

  users!: ReturnModelType<typeof User>;

  wikiPages!: ReturnModelType<typeof WikiPage>;

  constructor(
    private readonly config: ConfigService,
    private readonly mongo: MongoService
  ) { }

  async init(): Promise<void> {
    await this.mongo.init(this.config.mongoUrl);

    this.containers = this.mongo.getModel(Container, "containers");
    this.hosts = this.mongo.getModel(Host, "hosts");
    this.progress = this.mongo.getModel(Progress, "progress");
    this.secrets = this.mongo.getModel(Secret, "secrets");
    this.steamGames = this.mongo.getModel(SteamGame, "steamGames");
    this.roles = this.mongo.getModel(Role, "roles");
    this.rummikubGames = this.mongo.getModel(RummikubGame, "rummikubGames");
    this.users = this.mongo.getModel(User, "users");
    this.wikiPages = this.mongo.getModel(WikiPage, "wikiPages");
  }
}

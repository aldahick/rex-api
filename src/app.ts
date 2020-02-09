import { singleton } from "tsyringe";
import { WebServer } from "./server";
import { DatabaseService } from "./service/database";

@singleton()
export class Application {
  constructor(
    private db: DatabaseService,
    private webServer: WebServer
  ) { }

  async init() {
    await this.db.init();
    await this.webServer.init();
  }

  async start() {
    await this.webServer.start();
  }

  async stop() {
    await this.webServer.stop();
    await this.db.close();
  }
}

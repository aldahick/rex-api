import { singleton } from "tsyringe";
import { WebServer } from "./server";

@singleton()
export class Application {
  constructor(
    private webServer: WebServer
  ) { }

  async init() {
    await this.webServer.init();
  }

  async start() {
    await this.webServer.start();
  }

  async stop() {
    await this.webServer.stop();
  }
}

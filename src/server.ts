import * as http from "http";
import * as path from "path";
import * as express from "express";
import * as fs from "fs-extra";
import * as _ from "lodash";
import * as recursiveReaddir from "recursive-readdir";
import { container, singleton } from "tsyringe";
import { ConfigService } from "./service/config";
import { LoggerService } from "./service/logger";
import { RegistryService, Controller } from "./service/registry";

@singleton()
export class WebServer {
  express?: express.Application;
  httpServer?: http.Server;

  constructor(
    private config: ConfigService,
    private logger: LoggerService,
    private registryService: RegistryService
  ) { }

  async init() {
    this.express = express();

    const resolvers = await this.loadInjectables("resolver");
    await this.registryService.resolvers.init(this.express, resolvers);

    const controllers = await this.loadInjectables<Controller>("controller");
    this.registryService.controllers.init(this.express, controllers);
  }

  async start() {
    await new Promise(resolve => {
      if (!this.express) {
        return resolve();
      }
      this.httpServer = this.express.listen(this.config.httpPort, resolve);
    });
    this.logger.info("server.start", { port: this.config.httpPort });
  }

  async stop() {
    await new Promise((resolve, reject) => {
      if (!this.httpServer) {
        return resolve();
      }
      this.httpServer.close(err =>
        err ? reject(err) : resolve()
      );
    });
    this.logger.info("server.stop");
  }

  private async loadInjectables<T>(dir: string): Promise<T[]> {
    const fullDir = path.resolve(__dirname, dir);
    if (!await fs.pathExists(fullDir)) {
      return [];
    }
    return (await this.requireAll(fullDir)).map(t => container.resolve(t));
  }

  private async requireAll<T = any>(dir: string): Promise<T[]> {
    const files = await recursiveReaddir(path.resolve(__dirname, dir));
    return _.flatten(files
      .filter(f => f.endsWith(".js"))
      .map(require)
      .map(Object.values)
    );
  }
}

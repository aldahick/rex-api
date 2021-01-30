import "reflect-metadata";

import { Application, container } from "@athenajs/core";
import * as _ from "lodash";
import { InjectionToken } from "tsyringe";

import { IModule } from "./IModule";
import { authModule } from "./module/auth";
import { genericModule } from "./module/generic";
import { mediaModule } from "./module/media";
import { noteModule } from "./module/note";
import { progressModule } from "./module/progress";
import { roleModule } from "./module/role";
import { steamModule } from "./module/steam";
import { userModule } from "./module/user";
import { DiscordRegistry } from "./registry/discord";
import { DatabaseService } from "./service/database";

const modules = [authModule, genericModule, mediaModule, noteModule, progressModule, roleModule, steamModule, userModule];

const moduleItems = <Key extends keyof IModule>(key: Key): unknown[] => (
  _.flatten(modules.map(m => m[key] ?? [])) as InjectionToken<unknown>[]
);

const main = async (): Promise<void> => {
  const app = new Application();

  const db = container.resolve(DatabaseService);
  await db.init();

  app.registry.controller.register(moduleItems("controllers"));
  await app.registry.resolver.register(moduleItems("resolvers"), {
    schemaDir: `${__dirname}/../src`
  });

  const discordRegistry = container.resolve(DiscordRegistry);
  await discordRegistry.init();
  discordRegistry.register(moduleItems("commands"));
  app.on("stop", () => discordRegistry.close());

  await app.start();
};

// eslint-disable-next-line no-console
main().catch(console.error);

import "reflect-metadata";

import { Application, container } from "@athenajs/core";

import * as controllers from "./controller";
import * as discordCommands from "./discord";
import { DiscordRegistry } from "./registry/discord";
import * as resolvers from "./resolver";
import { DatabaseService } from "./service/database";

const main = async (): Promise<void> => {
  const app = new Application();

  const db = container.resolve(DatabaseService);
  await db.init();

  app.registry.controller.register(Object.values(controllers));
  await app.registry.resolver.register(Object.values(resolvers), {
    schemaDir: `${__dirname}/../graphql`
  });

  const discordRegistry = container.resolve(DiscordRegistry);
  await discordRegistry.init();
  discordRegistry.register(Object.values(discordCommands));
  app.on("stop", () => discordRegistry.close());

  await app.start();
};

// eslint-disable-next-line no-console
main().catch(console.error);

import { Application, container, RedisService } from "@athenajs/core";
import "reflect-metadata";
import * as controllers from "./controller";
import * as discordCommands from "./discord";
import * as queueHandlers from "./queue";
import { DiscordRegistry } from "./registry/discord";
import * as resolvers from "./resolver";
import { ConfigService } from "./service/config";
import { DatabaseService } from "./service/database";
import * as websocketHandlers from "./websocket";

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

  const config = container.resolve(ConfigService);
  if (config.redisUrl !== undefined) {
    const redis = container.resolve(RedisService);
    await redis.init(config.redisUrl);
    await app.registry.queue.register(Object.values(queueHandlers));
  }

  app.registry.websocket.register(Object.values(websocketHandlers));
};

// eslint-disable-next-line no-console
main().catch(console.error);

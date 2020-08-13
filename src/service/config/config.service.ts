import { BaseConfigService, configUtils } from "@athenajs/core";
import { singleton } from "tsyringe";

@singleton()
export class ConfigService extends BaseConfigService {
  readonly discord = {
    commandPrefix: configUtils.optional("DISCORD_COMMAND_PREFIX") ?? "~",
    token: configUtils.optional("DISCORD_TOKEN")
  };

  readonly googleAuth = {
    clientId: configUtils.optional("GOOGLE_CLIENT_ID")
  };

  readonly mediaDir = configUtils.optional("MEDIA_DIR");

  readonly mongoUrl = configUtils.required("MONGO_URL");

  readonly redisUrl = configUtils.required("REDIS_URL");

  readonly steamApiKey = configUtils.optional("STEAM_API_KEY");
}

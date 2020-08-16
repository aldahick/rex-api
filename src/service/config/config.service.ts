import { BaseConfigService, configUtils } from "@athenajs/core";
import { singleton } from "tsyringe";

@singleton()
export class ConfigService extends BaseConfigService {
  readonly discord = {
    commandPrefix: configUtils.optional("DISCORD_COMMAND_PREFIX") ?? "~",
    token: configUtils.optional("DISCORD_TOKEN")
  };

  readonly googleAuth = {
    clientIds: {
      mobile: configUtils.optional("GOOGLE_CLIENT_ID_MOBILE"),
      web: configUtils.optional("GOOGLE_CLIENT_ID_WEB")
    }
  };

  readonly mediaDir = configUtils.optional("MEDIA_DIR");

  readonly mongoUrl = configUtils.required("MONGO_URL");

  readonly redisUrl = configUtils.required("REDIS_URL");

  readonly steamApiKey = configUtils.optional("STEAM_API_KEY");
}

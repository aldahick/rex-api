import { BaseConfigService, ConfigUtils } from "@athenajs/core";
import { singleton } from "tsyringe";

@singleton()
export class ConfigService extends BaseConfigService {
  readonly discord = {
    commandPrefix: ConfigUtils.optional("DISCORD_COMMAND_PREFIX") || "~",
    token: ConfigUtils.optional("DISCORD_TOKEN")
  };
  readonly googleAuth = {
    clientId: ConfigUtils.optional("GOOGLE_CLIENT_ID")
  };
  readonly mediaDir = ConfigUtils.optional("MEDIA_DIR");
  readonly mongoUrl = ConfigUtils.required("MONGO_URL");
  readonly steamApiKey = ConfigUtils.optional("STEAM_API_KEY");
}

import { BaseConfigService, configUtils } from "@athenajs/core";
import { singleton } from "tsyringe";

@singleton()
export class ConfigService extends BaseConfigService {
  readonly aws = {
    accessKeyId: configUtils.optional("AWS_ACCESS_KEY_ID"),
    secretAccessKey: configUtils.optional("AWS_SECRET_ACCESS_KEY"),
    region: configUtils.optional("AWS_REGION"),

    snsArns: {
      ios: configUtils.optional("AWS_SNS_ARN_IOS")
    }
  };

  readonly discord = {
    commandPrefix: configUtils.optional("DISCORD_COMMAND_PREFIX") ?? "~",
    token: configUtils.optional("DISCORD_TOKEN", u => u || undefined)
  };

  readonly googleAuth = {
    clientIds: {
      mobile: configUtils.optional("GOOGLE_CLIENT_ID_MOBILE"),
      web: configUtils.optional("GOOGLE_CLIENT_ID_WEB")
    }
  };

  readonly mediaDir = configUtils.optional("MEDIA_DIR");

  readonly mongoUrl = configUtils.required("MONGO_URL");

  readonly redisUrl = configUtils.optional("REDIS_URL", u => u || undefined);

  readonly steamApiKey = configUtils.optional("STEAM_API_KEY");
}

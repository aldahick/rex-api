import { BaseConfigService, ConfigUtils } from "@athenajs/core";
import { singleton } from "tsyringe";

@singleton()
export class ConfigService extends BaseConfigService {
  readonly googleAuth = {
    clientId: ConfigUtils.required("GOOGLE_CLIENT_ID")
  };
  readonly mediaDir = ConfigUtils.required("MEDIA_DIR");
  readonly mongoUrl = ConfigUtils.required("MONGO_URL");
  readonly steamApiKey = ConfigUtils.required("STEAM_API_KEY");
}

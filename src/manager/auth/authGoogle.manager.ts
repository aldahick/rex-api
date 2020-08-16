import { singleton } from "tsyringe";
import { IAuthClientType } from "../../graphql/types";
import { ConfigService } from "../../service/config";

@singleton()
export class AuthGoogleManager {
  constructor(
    private readonly config: ConfigService
  ) { }

  getClientIdFromType(clientType: IAuthClientType): string | undefined {
    switch (clientType) {
      case IAuthClientType.Mobile:
        return this.config.googleAuth.clientIds.mobile;
      case IAuthClientType.Web:
        return this.config.googleAuth.clientIds.web;
    }
  }
}

import * as google from "googleapis";
import { singleton } from "tsyringe";
import { ConfigService } from "../config";

export interface GoogleTokenPayload {
  domain: string;
  email: string;
  userId: string;
}

@singleton()
export class GoogleAuthService {
  constructor(
    private config: ConfigService
  ) { }

  async getIdTokenPayload(idToken: string): Promise<GoogleTokenPayload | undefined> {
    const api = new google.GoogleApis();
    const ticket = await new api.auth.OAuth2().verifyIdToken({
      idToken,
      audience: this.config.googleAuth.clientId,
    });
    const payload = ticket.getPayload();
    const userId = ticket.getUserId();
    if (!userId || !payload?.email) {
      return undefined;
    }
    return {
      domain: payload.hd || "gmail.com",
      email: payload.email,
      userId,
    };
  }
}

import { singleton } from "tsyringe";
import { IMutationCreateAuthTokenArgs, IAuthToken } from "../graphql/types";
import { AuthManager } from "../manager/auth";
import { DatabaseService } from "../service/database";
import { GoogleAuthService } from "../service/google";
import { mutation } from "../service/registry";
import { HttpError } from "../util/HttpError";

@singleton()
export class AuthResolver {
  constructor(
    private authManager: AuthManager,
    private db: DatabaseService,
    private googleAuthService: GoogleAuthService
  ) { }

  @mutation()
  async createAuthToken(root: void, { googleIdToken }: IMutationCreateAuthTokenArgs): Promise<IAuthToken> {
    const payload = await this.googleAuthService.getIdTokenPayload(googleIdToken);
    if (!payload) {
      throw HttpError.forbidden("Invalid Google token");
    }
    const user = await this.db.users.findOne({ email: payload.email });
    if (!user) {
      throw HttpError.forbidden(`Missing user email=${payload.email}`);
    }
    return {
      token: this.authManager.signToken({
        userId: user._id
      }),
      user
    };
  }
}

import { singleton } from "tsyringe";
import { mutation, HttpError } from "@athenajs/core";
import { IMutationCreateAuthTokenGoogleArgs, IMutation, IMutationCreateAuthTokenLocalArgs } from "../graphql/types";
import { AuthManager } from "../manager/auth";
import { DatabaseService } from "../service/database";
import { GoogleAuthService } from "../service/google";
import { UserManager } from "../manager/user";

@singleton()
export class AuthResolver {
  constructor(
    private authManager: AuthManager,
    private db: DatabaseService,
    private googleAuthService: GoogleAuthService,
    private userManager: UserManager,
  ) { }

  @mutation()
  async createAuthTokenGoogle(root: void, { googleIdToken }: IMutationCreateAuthTokenGoogleArgs): Promise<IMutation["createAuthTokenGoogle"]> {
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

  @mutation()
  async createAuthTokenLocal(root: void, { username, password }: IMutationCreateAuthTokenLocalArgs): Promise<IMutation["createAuthTokenLocal"]> {
    const user = await this.db.users.findOne({
      $or: [
        { username },
        { email: username }
      ]
    });
    if (!user || !user.auth.passwordHash) {
      throw HttpError.forbidden("Invalid username/email or password");
    }
    if (!await this.userManager.checkPassword(password, user.auth.passwordHash)) {
      throw HttpError.forbidden("Invalid username/email or password");
    }
    return {
      token: this.authManager.signToken({
        userId: user._id
      }),
      user
    };
  }
}

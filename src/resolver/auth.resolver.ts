import { HttpError,mutation } from "@athenajs/core";
import { singleton } from "tsyringe";
import { IMutation, IMutationCreateAuthTokenGoogleArgs, IMutationCreateAuthTokenLocalArgs } from "../graphql/types";
import { AuthContext,AuthManager } from "../manager/auth";
import { UserManager } from "../manager/user";
import { DatabaseService } from "../service/database";
import { GoogleAuthService } from "../service/google";

@singleton()
export class AuthResolver {
  constructor(
    private authManager: AuthManager,
    private db: DatabaseService,
    private googleAuthService: GoogleAuthService,
    private userManager: UserManager,
  ) { }

  @mutation()
  async createAuthTokenGoogle(root: void, { googleIdToken }: IMutationCreateAuthTokenGoogleArgs, context: AuthContext): Promise<IMutation["createAuthTokenGoogle"]> {
    const googlePayload = await this.googleAuthService.getIdTokenPayload(googleIdToken);
    if (!googlePayload) {
      throw HttpError.forbidden("Invalid Google token");
    }
    const user = await this.db.users.findOne({ email: googlePayload.email });
    if (!user) {
      throw HttpError.forbidden(`Missing user email=${googlePayload.email}`);
    }
    const payload = {
      userId: user._id
    };
    context.setPayload(payload);
    return {
      token: this.authManager.signToken(payload),
      user
    };
  }

  @mutation()
  async createAuthTokenLocal(root: void, { username, password }: IMutationCreateAuthTokenLocalArgs, context: AuthContext): Promise<IMutation["createAuthTokenLocal"]> {
    const user = await this.db.users.findOne({
      $or: [
        { username },
        { email: username }
      ]
    });
    if (!user || !user.auth.passwordHash) {
      throw HttpError.forbidden("Invalid username/email or password");
    }
    if (!await this.userManager.password.isValid(password, user.auth.passwordHash)) {
      throw HttpError.forbidden("Invalid username/email or password");
    }
    const payload = {
      userId: user._id
    };
    context.setPayload(payload);
    return {
      token: this.authManager.signToken(payload),
      user
    };
  }
}

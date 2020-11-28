import { guard, HttpError, mutation } from "@athenajs/core";
import { singleton } from "tsyringe";

import { IAuthToken, IMutation, IMutationCreateAuthTokenArgs, IMutationCreateAuthTokenGoogleArgs, IMutationCreateAuthTokenLocalArgs } from "../graphql/types";
import { AuthContext, AuthManager } from "../manager/auth";
import { UserManager } from "../manager/user";
import { User } from "../model/User";
import { DatabaseService } from "../service/database";
import { GoogleAuthService } from "../service/google";

@singleton()
export class AuthResolver {
  constructor(
    private readonly authManager: AuthManager,
    private readonly db: DatabaseService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly userManager: UserManager,
  ) { }

  @mutation()
  async createAuthTokenGoogle(root: unknown, { googleIdToken, clientType }: IMutationCreateAuthTokenGoogleArgs, context: AuthContext): Promise<IMutation["createAuthTokenGoogle"]> {
    const clientId = this.authManager.google.getClientIdFromType(clientType);
    const googlePayload = await this.googleAuthService.getIdTokenPayload(googleIdToken, clientId);
    if (!googlePayload) {
      throw HttpError.forbidden("Invalid Google token");
    }
    const user = await this.db.users.findOne({ email: googlePayload.email });
    if (!user) {
      throw HttpError.forbidden(`Missing user email=${googlePayload.email}`);
    }
    return this.getAuthToken(user, context);
  }

  @mutation()
  async createAuthTokenLocal(root: unknown, { username, password }: IMutationCreateAuthTokenLocalArgs, context: AuthContext): Promise<IMutation["createAuthTokenLocal"]> {
    const user = await this.db.users.findOne({
      $or: [
        { username },
        { email: username }
      ]
    });
    if (!user || user.auth.passwordHash === undefined) {
      throw HttpError.forbidden("Invalid username/email or password");
    }
    if (!await this.userManager.password.isValid(password, user.auth.passwordHash)) {
      throw HttpError.forbidden("Invalid username/email or password");
    }
    return this.getAuthToken(user, context);
  }

  @guard({
    resource: "user",
    action: "createAny",
    attributes: "token"
  })
  @mutation()
  async createAuthToken(root: unknown, { userId }: IMutationCreateAuthTokenArgs): Promise<IMutation["createAuthToken"]> {
    return this.getAuthToken(await this.userManager.get(userId));
  }

  private getAuthToken(user: User, context?: AuthContext): IAuthToken {
    const payload = { userId: user._id };
    if (context) {
      context.setPayload(payload);
    }
    return {
      token: this.authManager.signToken(payload),
      user
    };
  }
}

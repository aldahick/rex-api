import { AuthCheck, authProvider, AuthService } from "@athenajs/core";
import * as express from "express";
import { singleton } from "tsyringe";

import { Role, RoleManager } from "../role";
import { AuthContext, IAuthTokenPayload } from "./auth.context";
import { AuthGoogleManager } from "./authGoogle.manager";

@authProvider
@singleton()
export class AuthManager {
  constructor(
    readonly google: AuthGoogleManager,
    private readonly authService: AuthService,
    private readonly roleManager: RoleManager
  ) { }

  signToken(payload: IAuthTokenPayload): string {
    return this.authService.signToken(payload);
  }

  isAuthorized(roles: Role[], check: AuthCheck): boolean {
    const permissions = this.roleManager.toPermissions(roles);
    if (!permissions.length) {
      return false;
    }
    return this.authService.isCheckValid(permissions, check);
  }

  getContext(req: express.Request, payload?: IAuthTokenPayload): AuthContext {
    return new AuthContext(req, payload);
  }
}

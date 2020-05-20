import { AuthCheck,authProvider, AuthService } from "@athenajs/core";
import * as express from "express";
import { singleton } from "tsyringe";
import { Role } from "../../model/Role";
import { RoleManager } from "../role";
import { AuthContext } from "./AuthContext";
import { AuthTokenPayload } from "./AuthTokenPayload";

@authProvider
@singleton()
export class AuthManager {
  constructor(
    private authService: AuthService,
    private roleManager: RoleManager
  ) { }

  signToken(payload: AuthTokenPayload): string {
    return this.authService.signToken(payload);
  }

  isAuthorized(roles: Role[], check: AuthCheck): boolean {
    const permissions = this.roleManager.toPermissions(roles);
    if (permissions.length === 0) {
      return false;
    }
    return this.authService.isCheckValid(permissions, check);
  }

  getContext(req: express.Request, payload?: AuthTokenPayload): AuthContext {
    return new AuthContext(req, payload);
  }
}

import * as express from "express";
import { singleton } from "tsyringe";
import { AuthService, authProvider, AuthCheck } from "@athenajs/core";
import { Role } from "../../model/Role";
import { RoleManager } from "../role";
import { AuthTokenPayload } from "./AuthTokenPayload";
import { AuthContext } from "./AuthContext";

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
    return this.authService.isCheckValid(permissions.map(p => ({
      ...p,
      roleName: p.role.name
    })), check);
  }

  getContext(req: express.Request, payload?: AuthTokenPayload): AuthContext {
    return new AuthContext(req, payload);
  }
}

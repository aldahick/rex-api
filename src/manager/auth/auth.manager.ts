import * as express from "express";
import * as jwt from "jsonwebtoken";
import { singleton } from "tsyringe";
import { AuthService, authProvider, AuthCheck } from "@athenajs/core";
import { Role } from "../../model/Role";
import { ConfigService } from "../../service/config";
import { RoleManager } from "../role";
import { AuthTokenPayload } from "./AuthTokenPayload";
import { AuthContext } from "./AuthContext";

@authProvider
@singleton()
export class AuthManager {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
    private roleManager: RoleManager
  ) { }

  signToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, this.config.jwtKey);
  }

  getPayload(token: string): AuthTokenPayload | undefined {
    try {
      return jwt.verify(token, this.config.jwtKey) as any;
    } catch (err) {
      return undefined;
    }
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

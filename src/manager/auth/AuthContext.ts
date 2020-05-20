import { AuthCheck,BaseAuthContext } from "@athenajs/core";
import { Request } from "express";
import { container } from "tsyringe";
import { Role } from "../../model/Role";
import { User } from "../../model/User";
import { UserManager } from "../user";
import { AuthManager } from "./auth.manager";
import { AuthTokenPayload } from "./AuthTokenPayload";

export class AuthContext implements BaseAuthContext {
  private authManager = container.resolve(AuthManager);
  private userManager = container.resolve(UserManager);

  private _user?: User | "notFound";
  private _roles?: Role[];

  constructor(
    readonly req: Request,
    private payload?: AuthTokenPayload
  ) { }

  get userId(): string | undefined {
    return this.payload?.userId;
  }

  async user(): Promise<User | undefined> {
    if (!this.payload?.userId || this._user === "notFound") {
      return undefined;
    }
    if (this._user) {
      return this._user;
    }
    this._user = await this.userManager.getSafe(this.payload?.userId);
    if (!this._user) {
      this._user = "notFound";
      return undefined;
    }
    return this._user;
  }

  async isAuthorized(check?: AuthCheck): Promise<boolean> {
    const user = await this.user();
    if (!user) {
      return false;
    }
    if (!check) {
      return true;
    }
    if (!this._roles) {
      this._roles = await this.userManager.getRoles(user);
    }
    return this.authManager.isAuthorized(this._roles, check);
  }
}

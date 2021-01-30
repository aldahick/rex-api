import { AuthCheck, BaseAuthContext } from "@athenajs/core";
import { Request } from "express";
import { container } from "tsyringe";

import { Role } from "../role";
import { User, UserManager } from "../user";
import { AuthManager } from "./auth.manager";

export interface IAuthTokenPayload {
  userId: string;
}

export class AuthContext implements BaseAuthContext {
  private readonly authManager = container.resolve(AuthManager);

  private readonly userManager = container.resolve(UserManager);

  private _user?: User | "notFound";

  private _roles?: Role[];

  constructor(
    readonly req: Request,
    private payload?: IAuthTokenPayload
  ) { }

  setPayload(payload: IAuthTokenPayload): void {
    this.payload = payload;
    this._user = undefined;
  }

  get userId(): string | undefined {
    return this.payload?.userId;
  }

  async user(): Promise<User | undefined> {
    if (this.payload?.userId === undefined || this._user === "notFound") {
      return undefined;
    }
    if (this._user) {
      return this._user;
    }
    this._user = await this.userManager.getSafe(this.payload.userId);
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

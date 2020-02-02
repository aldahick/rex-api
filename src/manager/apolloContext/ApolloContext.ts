import { AuthTokenPayload } from "../auth/AuthTokenPayload";
import { AuthManager } from "../auth";
import { UserManager } from "../user";
import { User } from "../../model/User";
import { AuthCheck } from "../auth/AuthCheck";
import { Role } from "../../model/Role";
import { Request } from "express";
import { container } from "tsyringe";

export class ApolloContext {
  private authManager = container.resolve(AuthManager);
  private userManager = container.resolve(UserManager);

  private payload?: AuthTokenPayload;

  private _user?: User | "notFound";
  private _roles?: Role[];

  constructor(
    private req: Request
  ) {
    this.payload = this.authManager.getPayload(req.headers.authorization?.split(" ")[1] || "");
  }

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

  async isAuthorized(check: AuthCheck): Promise<boolean> {
    const user = await this.user();
    if (!user) {
      return false;
    }
    if (!this._roles) {
      this._roles = await this.userManager.getRoles(user);
    }
    return this.authManager.isAuthorized(this._roles, check);
  }
}

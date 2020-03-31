import { Request } from "express";
import { container } from "tsyringe";
import { Role } from "../../model/Role";
import { User } from "../../model/User";
import { AuthManager } from "../auth";
import { AuthCheck } from "../auth/AuthCheck";
import { AuthTokenPayload } from "../auth/AuthTokenPayload";
import { UserManager } from "../user";

export class ApolloContext {
  private authManager = container.resolve(AuthManager);
  private userManager = container.resolve(UserManager);

  private payload?: AuthTokenPayload;

  private _user?: User | "notFound";
  private _roles?: Role[];

  constructor(
    private req: Request
  ) {
    let token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      // websocket requests don't have .query, only ._query
      // wish I knew why
      token = (req.query || (req as any as { _query: Request["query"] })._query || {}).token;
    }
    this.payload = this.authManager.getPayload(token || "");
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

import * as jwt from "jsonwebtoken";
import * as _ from "lodash";
import { singleton } from "tsyringe";
import { AccessControl } from "accesscontrol";
import { ConfigService } from "../../service/config";
import { RoleManager } from "../role";
import { Role } from "../../model/Role";
import { AuthTokenPayload } from "./AuthTokenPayload";
import { AuthCheck } from "./AuthCheck";

@singleton()
export class AuthManager {
  constructor(
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
    const ac = new AccessControl(permissions.map(permission => ({
      ...permission,
      attributes: "*",
      role: permission.role.name
    }))
    );
    const checks = _.flatten(roles.map(r => check(ac.can(r.name))));
    const checkGroups = _.groupBy(checks, c => `${c.resource}-${c.attributes}`);
    for (const checkGroup of Object.values(checkGroups)) {
      if (!checkGroup.some(c => c.granted)) {
        return false;
      }
    }
    return true;
  }
}

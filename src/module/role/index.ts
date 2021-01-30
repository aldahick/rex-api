import { IModule } from "../../IModule";
import { RoleResolver } from "./role.resolver";

export * from "./model";
export * from "./role.manager";

export const roleModule: IModule = {
  resolvers: [RoleResolver]
};

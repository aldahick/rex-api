import { IModule } from "../../IModule";
import { AuthResolver } from "./auth.resolver";

export * from "./auth.context";
export * from "./auth.manager";

export const authModule: IModule = {
  resolvers: [AuthResolver]
};

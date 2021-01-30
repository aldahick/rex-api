import { IModule } from "../../IModule";
import { UserResolver } from "./user.resolver";

export * from "./model";
export * from "./user.manager";

export const userModule: IModule = {
  resolvers: [UserResolver]
};

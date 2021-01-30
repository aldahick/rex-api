import { IModule } from "../../IModule";
import { ProgressResolver } from "./progress.resolver";

export * from "./model";
export * from "./progress.manager";

export const progressModule: IModule = {
  resolvers: [ProgressResolver]
};
